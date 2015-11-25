var fs = require('fs'),
  path = require('path'),
  util = require('util'),
  request = require('request');

var index = 1,
  rn = 60;
patchPreImg(0);

function patchPreImg(pn) {
  var tag1 = '摄影', tag2 = '风景',
    url = 'http://image.baidu.com/data/imgs?pn=%s&rn=%s&p=channel&from=1&col=%s&tag=%s&sort=1&tag3=',
    url = util.format(url, pn, rn, tag1, tag2),
    url = encodeURI(url),
    dir = 'D:/downloads/images/',
    dir = path.join(dir, tag1, tag2),
    dir = mkdirSync(dir);

  request(url, function(error, response, html) {
    var data = JSON.parse(html);
    if (data && Array.isArray(data.imgs)) {
      var imgs = data.imgs;
      imgs.forEach(function(img) {
        if (Object.getOwnPropertyNames(img).length > 0) {
          var desc = img.desc || ((img.owner && img.owner.userName) + img.column);
          if (desc.length > 25) desc = desc.substr(0, 25) + '...';
          desc += '(' + img.id + ')';
          var downloadUrl = img.downloadUrl || img.objUrl;
          (function(url, dir, desc) {
            downloadImg(url, dir, desc);
          })(downloadUrl, dir, desc);
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

function downloadImg(url, dir, desc) {
  var fileType = 'jpg';
  if (url.match(/\.(\w+)$/)) fileType = RegExp.$1;
  desc += '.' + fileType;
  desc = replaceIllegalChars(desc);
  var filePath = path.join(dir, desc);

  var options = {
    url: url,
    headers: {
      Host: 'f.hiphotos.baidu.com',
      Cookie: 'BAIDUID=810ACF57B5C38556045DFFA02C61A9F8:FG=1; PSTM=1448247876; BIDUPSID=0AF8402EC49FD02EF87E81FFF2658FC5; BDRCVFR[en5Q-dJqX6n]=mbxnW11j9Dfmh7GuZR8mvqV; BDUSS=UJRaXFtMTZkLTJiZHZMUXJwc3J2Q2JSN3RoSGt2YTVnSzJ2YnoybzlEN1RhWHBXQVFBQUFBJCQAAAAAAAAAAAEAAADIXDYBcWlhb2xlMTIzAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAANPcUlbT3FJWQ; BDRCVFR[X_XKQks0S63]=mk3SLVN4HKm; BDRCVFR[dG2JNJb_ajR]=mk3SLVN4HKm; H_PS_PSSID=1446_13550_17945_17782_17970_18042_17838_17001_17073_15600_12127_18090',
      Referer: 'http://image.baidu.com/data/imgs?col=%E6%91%84%E5%BD%B1&tag=%E5%9B%BD%E5%AE%B6%E5%9C%B0%E7%90%86&sort=1&tag3=&pn=118&rn=59&p=channel&from=1',
      'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/48.0.2564.10 Safari/537.36'
    }
  };
  var startTime = new Date().getTime();
  request(options)
    .on('response', function() {
      var endTime = new Date().getTime();
      console.log('Downloading...%s.. %s, 耗时: %ss', index++, desc, (endTime - startTime) / 1000);
      if (index % rn == 0) {
        setTimeout(function() {
          patchPreImg(index);
        }, 6500);
      }
    })
    .pipe(fs.createWriteStream(filePath));
}