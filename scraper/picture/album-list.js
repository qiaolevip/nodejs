var fs = require('fs'),
  path = require('path'),
  util = require('util'),
  request = require('request');

var index = 1,
  max = 1100;
patchPreImg(0);

function patchPreImg(pn) {
  var tag1 = '海底世界', albumId = 'f188ac6ebbbaa541416ddf2ef228172fd3d3681d',
    url = 'http://xiangce.baidu.com/picture/album/list/%s?view_type=tile&size=60&pn=%s&format=json&type=default&_=%s',
    url = util.format(url, albumId, pn, new Date().getTime()),
    url = encodeURI(url),
    dir = 'D:/downloads/images',
    dir = path.join(dir, 'xiangce', tag1),
    dir = mkdirSync(dir);

  request(url, function(error, response, html) {
    var data = JSON.parse(html);
    if (data && data.data && Array.isArray(data.data.picture_list)) {
      var imgs = data.data.picture_list,
        pageSize = imgs.length;
      imgs.forEach(function(img) {
        if (Object.getOwnPropertyNames(img).length > 0) {
          var desc = img.picture_name + img.picture_sign;
          if (desc.length > 32) desc = desc.substr(0, 32);
          var downloadUrl = img.pic_big_src;
          downloadImg(downloadUrl, dir, desc, pageSize);
        }
      });
    }
  });
}

function mkdirSync(dir) {
  var parts = dir.split(path.sep);
  for (var i = 1; i <= parts.length; i++) {
    dir = path.join.apply(null, parts.slice(0, i));
    fs.existsSync(dir) || fs.mkdirSync(dir);
  }
  return dir;
}

function replaceIllegalChars(str) {
  return str.replace(/[\\/:*?"<>|\n]/g, '');
}

function getFilePath(dir, url, desc) {
  var fileType = 'jpg';
  if (url.match(/\.(\w+)$/)) fileType = RegExp.$1;
  desc += '.' + fileType;
  desc = replaceIllegalChars(desc);
  var filePath = path.join(dir, desc);
  return filePath;
}

function downloadImg(url, dir, desc, pageSize) {
  (function(url, dir, desc, pageSize) {
    var options = {
      url: url,
      headers: {
        Host: 'd.picphotos.baidu.com',
        Cookie: 'BAIDUID=810ACF57B5C38556045DFFA02C61A9F8:FG=1; PSTM=1448247876; BIDUPSID=0AF8402EC49FD02EF87E81FFF2658FC5; BDUSS=UJRaXFtMTZkLTJiZHZMUXJwc3J2Q2JSN3RoSGt2YTVnSzJ2YnoybzlEN1RhWHBXQVFBQUFBJCQAAAAAAAAAAAEAAADIXDYBcWlhb2xlMTIzAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAANPcUlbT3FJWQ; BDRCVFR[vT8MZmuAO6s]=mk3SLVN4HKm; BDRCVFR[KSMS7Wag2CC]=mk3SLVN4HKm; H_PS_PSSID=17945',
        Referer: 'http://xiangce.baidu.com/picture/album/list/4ff6d12e2f075f13a8a383cbef5443cc313455c7?view_type=tile&size=60&pn=59&format=json&type=default&_=1448435578116',
        'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/48.0.2564.10 Safari/537.36'
      }
    };
    var startTime = new Date().getTime();
    request(options)
      .on('response', function() {
        var endTime = new Date().getTime();
        console.log('Downloading...%s.. %s, 耗时: %ss', index, desc, (endTime - startTime) / 1000);
        if (index % pageSize == 0 && index <= max) {
          setTimeout(function() {
            patchPreImg(index);
          }, 6500);
        }
        index++;
      })
      .pipe(fs.createWriteStream(getFilePath(dir, url, desc)));
  }(url, dir, desc, pageSize));
}