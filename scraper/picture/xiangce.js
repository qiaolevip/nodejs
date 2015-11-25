var fs = require('fs'),
  path = require('path'),
  util = require('util'),
  request = require('request');

var index = 1,
  max = 1100;
patchPreImg(0);

function patchPreImg(pn) {
  var tag1 = '壁纸', tag2 = '旅游风光',
    url = 'http://xiangce.baidu.com/square/294367?type=json&pn=%s&_=%s',
    url = util.format(url, pn, new Date().getTime()),
    url = encodeURI(url),
    dir = 'D:/downloads/images',
    dir = path.join(dir, 'xiangce', tag1, tag2),
    dir = mkdirSync(dir),
    dldUrl = 'http://xiangce.baidu.com/picture/raw?type=download&picture_sign=';

  request(url, function(error, response, html) {
    var data = JSON.parse(html);
    if (data && data.data && Array.isArray(data.data.album_list)) {
      var imgs = data.data.album_list,
        pageSize = imgs.length;
      imgs.forEach(function(img) {
        if (Object.getOwnPropertyNames(img).length > 0) {
          var name = img.pic_name,
            desc = '';
          if (!/^\w{32}$/.test(name)) desc = name;
          desc += img.pic_sign;
          if (desc.length > 32) desc = desc.substr(0, 32);
          var downloadUrl = dldUrl + img.pic_sign;
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

function downloadImg(url, dir, desc, pageSize) {
  desc += '.jpg';
  desc = replaceIllegalChars(desc);
  var filePath = path.join(dir, desc);

  (function(url, desc, pageSize) {
    var options = {
      url: url,
      headers: {
        Host: 'xiangce.baidu.com',
        Cookie: 'BAIDUID=810ACF57B5C38556045DFFA02C61A9F8:FG=1; PSTM=1448247876; BIDUPSID=0AF8402EC49FD02EF87E81FFF2658FC5; BDUSS=UJRaXFtMTZkLTJiZHZMUXJwc3J2Q2JSN3RoSGt2YTVnSzJ2YnoybzlEN1RhWHBXQVFBQUFBJCQAAAAAAAAAAAEAAADIXDYBcWlhb2xlMTIzAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAANPcUlbT3FJWQ; user-cover-galleria=1; H_PS_PSSID=1446_13550_18156_17945_17970_18042_17838_17001_17073_15600_12127_18090; bdshare_firstime=1448434855381; BDRCVFR[vT8MZmuAO6s]=mk3SLVN4HKm; Hm_lvt_68a18099bd17263ae1ecb55159cb0f95=1448336395,1448336422,1448337030; Hm_lpvt_68a18099bd17263ae1ecb55159cb0f95=1448435559; RESOLUTION=1600',
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
            patchPreImg((index - 1) / pageSize);
          }, 6500);
        }
        index++;
      })
      .pipe(fs.createWriteStream(filePath));
  }(url, desc, pageSize));
}