'use strict';

module.exports = function(grunt) {
  grunt.registerMultiTask('version', 'Retrieves the current git revision', function(property) {
    var options = this.options({
      property: 'meta.revision',
      ref: 'HEAD',
      short: false
    }), dest = this.data.dest;

    
    var done = this.async(false), content = new Array(), data = {};

    var writeLog = function()  {  
      content.push("*************************Begin***************************")
      if (!!options.project)  {
        content.push("Project: " + options.project);
      }

      if (!!options.version)  {
        content.push("Version: " + options.version);      
      }

      content.push("SHA-1: " + data.sha);
      content.push("builder: " + data.email);
      content.push("Git URL: " + data.url);
      content.push("Date: " + new Date().toLocaleString())
      content.push("*************************End*****************************")

      grunt.file.write(dest || 'release.log', content.join('\r\n'))
    }

    //get sha-1
    grunt.util.spawn({
      cmd: 'git',
      args: ['rev-parse', options.short && '--short', options.ref].filter(Boolean)
    }, function(err, result) {
      if (err) {
        grunt.log.error(err);

        return done(false);
      }

      var version = result.toString();

      grunt.config(options.property, version);
      // grunt.log.writeln(options.ref + ' at version ' + version);
      data.sha = version;
      getRef()
      // done(true);
    });

    //get sha-1
    var getRef = function()  {
        grunt.util.spawn({
          cmd: 'git',
          args: ['symbolic-ref', '--short', options.ref].filter(Boolean)
        }, function(err, result) {
          if (err) {
            grunt.log.error(err);

            return done(false);
          }

          var ref = result.toString();

          grunt.config(options.property, ref);
          // grunt.log.writeln(options.ref + ' at version ' + ref);
          // grunt.file.write(options.dest || 'release.log', "Code Version:" + ref)
          data.sha = (ref + '-' + data.sha)
          getEmail()
          // done(true);
        });
    }
    
    //get builder
    var getEmail = function() {
        grunt.util.spawn({
          cmd: 'git',
          args: ['config', '--get', "user.email"].filter(Boolean)
        }, function(err, result) {
          if (err) {
            grunt.log.error(err);

            return done(false);
          }

          var email = result.toString();

          grunt.config(options.property, email);
          
          data.email = email
          getRemoteUrl()
        });
    }

    var getRemoteUrl = function() {
        grunt.util.spawn({
          cmd: 'git',
          args: ['config', '--get', "remote.origin.url"].filter(Boolean)
        }, function(err, result) {
          if (err) {
            grunt.log.error(err);

            return done(false);
          }

          var url = result.toString();

          grunt.config(options.property, url);
          
          data.url = url
          writeLog()

          done(true);
        });
    }
  });
};