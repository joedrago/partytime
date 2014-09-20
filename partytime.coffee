minimist = require 'minimist'
youtube  = require 'youtube-feeds'
ytdl     = require 'ytdl-core'
async    = require 'async'
fs       = require 'fs'
progress = require 'progress-stream'

leadingZeroes = (v) ->
  vstr = String(v)
  return "000".substr(-3 + vstr.length) + vstr

downloadVideo = (video, cb) ->
  if fs.existsSync video.filename
    console.log "[#{leadingZeroes(video.index+1)} / #{video.total}] skip existing #{video.id} -> #{video.filename} exists"
    cb() if cb
    return

  console.log "[#{leadingZeroes(video.index+1)} / #{video.total}]   downloading #{video.id} -> #{video.filename}"

  progressStream = progress { time: 1000 }
  progressStream.on 'progress', (progress) ->
    if progress.percentage == 100
      console.log("  -> Done!")
    else
      console.log("  -> transferred #{progress.transferred} bytes")
  progressStream.on 'end', ->
    cb() if cb

  downloadStream = ytdl "http://www.youtube.com/watch?v=#{video.id}"
  downloadStream.pipe(progressStream).pipe(fs.createWriteStream(video.filename))
  return

downloadVideos = (list) ->
  async.mapSeries list, downloadVideo, (err, results) ->
    console.log "Downloads complete!"

syntax = ->
  console.error "Syntax: partytime [-h] playlistid\n"
  console.error "        Downloads all files in Youtube playlist id 'playlistid' as high quality MP4s into the current directory."
  console.error "        -h,--help         This help output"
  process.exit(1)

main = ->
  args = minimist(process.argv.slice(2), {
    boolean: ['h']
    alias:
      help: 'h'
  })
  if args.help or args._.length < 1
    syntax()

  playlistId = args._[0]

  console.log "Querying playlist ID: #{playlistId} ..."
  youtube.feeds.playlist playlistId, {}, (err, playlist) ->
    downloadList = []
    index = 0
    for item in playlist.items
      downloadItem =
        index: index++
        total: playlist.totalItems
        id: item.video.id
        filename: leadingZeroes(index) + " - " + item.video.title.replace(/[^- a-z0-9]/ig, "_") + ".mp4"
      downloadList.push downloadItem

    console.log "Found #{downloadList.length} videos. Downloading..."
    downloadVideos downloadList

main()
