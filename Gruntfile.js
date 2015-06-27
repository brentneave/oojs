module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    sass: {
      dist: {
        options:{
          style:'compressed'
        },
        files: {
          'dist/css/screen.css' : 'src/scss/screen.scss'
        }
      }
    },
    autoprefixer:{
      dist:{
        files:{
          'dist/css/screen.css':'dist/css/screen.css'
        }
      }
    },
    concat: {
      dist: {
        src: ['src/js/**/*.js'],
        dest: 'dist/js/site.js'
      }
    },
    uglify: {
      dist: {
        src: 'dist/js/site.js',
        dest: 'dist/js/site.js'
      },
    },
    watch: {
      css: {
        files: ['src/scss/**/*.scss'],
        tasks: ['sass', 'autoprefixer']
      },
      js: {
        files: ['src/js/**/*.js'],
        tasks: ['concat']
      }
    }
  });
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-autoprefixer');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.registerTask('default',['sass', 'autoprefixer', 'concat', 'watch']);
}