import fs from 'fs';
import path from 'path';
import iconv from 'iconv';
import charset from 'charset';
import jschardet from 'jschardet';
import sha from 'sha';
import cheerio from 'cheerio';
import htmlToText from 'html-to-text';
import uppercamelcase from 'uppercamelcase';

import Utils from '../utils/serverUtils';

export default class DocumentParser {
  static getHtmlAsText(documentPath) {
    try {
      var relPath = documentPath,
         htmlFile = this.readFile(relPath),
       htmlString = htmlFile.toString();

      var options = {
        wordwrap: false,
        uppercaseHeadings: false,
        ignoreHref: true,
        ignoreImage: true
      };

      return htmlToText.fromString(htmlFile, options) || '';
    }
    catch (e) {
      console.error(e);
      return '';
    }
  }

  static getHtmlTitle(documentPath, callback) {
    try {
      var relPath = documentPath,
         htmlFile = this.readFile(relPath),
       htmlString = htmlFile.toString(),
                $ = cheerio.load(htmlString),
            title = $('head > title').text() || $('title').text() || $('h1').first().text() || 'Untitled Document';

      //console.log(relPath, title);
      return title;
    }
    catch (e) {
      console.error(e);
      return '';
    }
  }

  static getHtmlDocname(documentPath) {
    try {
      var relPath = documentPath,
          fileExt = path.extname(relPath),
         fileName = path.basename(relPath, fileExt),
            route = uppercamelcase(fileName);

      //console.log(relPath, route);
      return route;
    }
    catch (e) {
      console.error(e);
      return '';
    }
  }

  static getHtmlRoute(documentPath) {
    try {
      var relPath = documentPath,
         fileName = path.basename(relPath);

      //console.log(relPath, fileName);
      return fileName;
    }
    catch (e) {
      console.error(e);
      return '';
    }
  }

  static getHash(documentPath) {
    try {
      return sha.getSync(documentPath, { algorithm: 'sha256' });
    }
    catch (e) {
      console.error(e);
      return '';
    }
  }

  static cleanDocument(documentPath) {
    try {
      var relPath = documentPath,
          fileDir = path.dirname(relPath),
          fileExt = path.extname(relPath),
         fileName = path.basename(relPath, fileExt),
      newFilename = fileName + fileExt;

      var htmlFile = this.readFile(relPath),
        htmlString = htmlFile.toString(),
                 $ = cheerio.load(htmlFile);

      const blockedIds = [ 'disqus', 'taboola', 'cresta', 'pubexchange', 'newsletter', 'sociales' ];
      const blockedClasses = [ 'share', 'entry-share', 'textwidget', 'widget_ad', 'fb-comments', 'fb-social-plugin', 'fb-login-button', 'fb_iframe_widget', 'leikiwidget' ];
      const blockedElements = [ 'iframe', 'object' ];

      const adRemover = (elem) => {
        // dgacitua: Remove all onclick events
        $(elem).removeAttr('onclick');
        
        // dgacitua: Minimal ad filter by div id
        if (Utils.startsWithArray($(elem).attr('id'), blockedIds)) {
          $(elem).remove();
          return true;
        }

        // dgacitua: Minimal ad filter by div class
        blockedClasses.some((el, idx, arr) => {
          if ($(elem).hasClass(el)) {
            $(elem).remove();
            return true;
          }
        });

        return false;
      };

      const specialElementsRemover = (elementArray) => {
        elementArray.forEach((el, idx, arr) => {
          $(el).each((i, elem) => { $(elem).remove() });
        });
      };

      specialElementsRemover(blockedElements);

      // dgacitua: Remove onclick attribute from anchor tags
      $('a').each((i, elem) => {
        $(elem).removeAttr('onclick');
      });

      // dgacitua: Remove all external links
      $('a[href]').each((i, elem) => {
        $(elem).attr('href', 'javascript:void(0)');
        $(elem).removeAttr('target');
      });

      $('div').each((i, elem) => { adRemover(elem) });
      $('aside').each((i, elem) => { adRemover(elem) });

      $('p script').each((i, elem) => {
        if ($(elem).attr('type') === 'text/javascript') {
          $(elem).remove();
        }
      });

      $('select').each((i, elem) => {
        $(elem).removeAttr('id');
        $(elem).removeAttr('onchange');
      });

      // dgacitua: Remove javascript
      $('script').each((i, elem) => {
        $(elem).removeAttr('src');

        /*
        if ($(elem).attr('type') === 'text/javascript' || $(elem).attr('type') === 'application/javascript') {
          $(elem).remove();
        }
        */
      });

      // dgacitua: Disable input elements
      $('input').each((i, elem) => {
        $(elem).removeAttr('id');
        $(elem).attr('disabled', 'true');
      });

      // dgacitua: Disable button elements
      $('button').each((i, elem) => {
        $(elem).removeAttr('id');
        $(elem).attr('disabled', 'true');
      });

      // dgacitua: Disable submit
      $('input[type="submit"]').each((i, elem) => {
        $(elem).removeAttr('type');
      });

      $('button[type="submit"]').each((i, elem) => {
        $(elem).removeAttr('type');
      });

      // dgacitua: Disable form action
      $('form').each((i, elem) => {
        $(elem).removeAttr('action');
        $(elem).removeAttr('method');
      });

      var cleanedHtml = $.html();

      fs.writeFileSync(path.join(fileDir, newFilename), cleanedHtml);
      //console.log('Document Cleaned!', newFilename);

      return true;
    }
    catch (e) {
      console.error(e);
      return false;
    }
  }

  static readFile(path) {
    try {
      // dgacitua: http://stackoverflow.com/a/18711982
      var htmlBuffer = fs.readFileSync(path),
          htmlString = htmlBuffer.toString(),
            encoding = charset([], htmlString);   // || jschardet.detect(htmlString).encoding.toLowerCase();

      if (encoding === 'utf-8' || encoding === 'utf8' || !encoding) {
        return htmlString;
      }
      else {
        var ic = new iconv.Iconv(encoding, 'UTF-8//TRANSLIT//IGNORE'),
           buf = ic.convert(htmlBuffer),
           str = buf.toString('utf-8');

        return str;
      }
    }
    catch (e) {
      console.error(e);
      return '';
    }
  }

  static getDocumentInfo(documentPath) {
    var obj = {
      title: this.getHtmlTitle(documentPath),
      indexedBody: this.getHtmlAsText(documentPath),
      date: Utils.getDate(),
      docName: this.getHtmlDocname(documentPath),
      route: this.getHtmlRoute(documentPath),
      hash: this.getHash(documentPath)
    };

    //console.log('Document Parsed!', obj.route);
    return obj;
  }
}