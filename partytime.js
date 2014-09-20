// Generated by CoffeeScript 1.8.0
(function() {
  var async, downloadVideo, downloadVideos, fs, leadingZeroes, main, minimist, progress, syntax, youtube, ytdl;

  minimist = require('minimist');

  youtube = require('youtube-feeds');

  ytdl = require('ytdl-core');

  async = require('async');

  fs = require('fs');

  progress = require('progress-stream');

  leadingZeroes = function(v) {
    var vstr;
    vstr = String(v);
    return "000".substr(-3 + vstr.length) + vstr;
  };

  downloadVideo = function(video, cb) {
    var downloadStream, progressStream;
    if (fs.existsSync(video.filename)) {
      console.log("[" + (leadingZeroes(video.index + 1)) + " / " + video.total + "] skip existing " + video.id + " -> " + video.filename + " exists");
      if (cb) {
        cb();
      }
      return;
    }
    console.log("[" + (leadingZeroes(video.index + 1)) + " / " + video.total + "]   downloading " + video.id + " -> " + video.filename);
    progressStream = progress({
      time: 1000
    });
    progressStream.on('progress', function(progress) {
      if (progress.percentage === 100) {
        return console.log("  -> Done!");
      } else {
        return console.log("  -> transferred " + progress.transferred + " bytes");
      }
    });
    progressStream.on('end', function() {
      if (cb) {
        return cb();
      }
    });
    downloadStream = ytdl("http://www.youtube.com/watch?v=" + video.id);
    downloadStream.pipe(progressStream).pipe(fs.createWriteStream(video.filename));
  };

  downloadVideos = function(list) {
    return async.mapSeries(list, downloadVideo, function(err, results) {
      return console.log("Downloads complete!");
    });
  };

  syntax = function() {
    console.error("Syntax: partytime [-h] playlistid\n");
    console.error("        Downloads all files in Youtube playlist id 'playlistid' as high quality MP4s into the current directory.");
    console.error("        -h,--help         This help output");
    return process.exit(1);
  };

  main = function() {
    var args, playlistId;
    args = minimist(process.argv.slice(2), {
      boolean: ['h'],
      alias: {
        help: 'h'
      }
    });
    if (args.help || args._.length < 1) {
      syntax();
    }
    playlistId = args._[0];
    console.log("Querying playlist ID: " + playlistId + " ...");
    return youtube.feeds.playlist(playlistId, {}, function(err, playlist) {
      var downloadItem, downloadList, index, item, _i, _len, _ref;
      downloadList = [];
      index = 0;
      _ref = playlist.items;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        item = _ref[_i];
        downloadItem = {
          index: index++,
          total: playlist.totalItems,
          id: item.video.id,
          filename: leadingZeroes(index) + " - " + item.video.title.replace(/[^- a-z0-9]/ig, "_") + ".mp4"
        };
        downloadList.push(downloadItem);
      }
      console.log("Found " + downloadList.length + " videos. Downloading...");
      return downloadVideos(downloadList);
    });
  };

  main();

}).call(this);