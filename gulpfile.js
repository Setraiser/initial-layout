
const project_folder = "dist"
const source_folder = "src"
const fs = require('fs')

const path = {
  build: {
    html: project_folder + "/",
    css: project_folder + "/css/",
    js: project_folder + "/js/",
    img: project_folder + '/assets/img/',
    fonts: project_folder + '/assets/fonts/'
  },
  src: {
    html: [source_folder + "/*.html", "!" + source_folder + "/_*.html"], /* Игнорировать файлы html  с нижним подчеркиванием, т.к. они подключаются к основному файлу (_header.html) */
    css: source_folder + "/scss/style.scss",
    js: source_folder + "/js/scripts.js",
    img: source_folder + '/assets/img/**/*.{jpg, svg, gif, ico, webp}',
    fonts: source_folder + '/assets/fonts/*.ttf'
  },
  watch: {
    html: source_folder + "/**/*.html",
    css: source_folder + "/scss/**/*.scss",
    js: source_folder + "/js/**/*.js",
    img: source_folder + '/assets/img/**/*.{jpg, svg, gif, ico, webp}'
  },
  clean: "./" + project_folder + "/"
}

const {src, dest} = require('gulp'),
      gulp = require('gulp'),
      browsersync = require('browser-sync').create(),
      fileinclude = require('gulp-file-include'),
      del = require('del'),
      scss = require('gulp-sass'),
      autoprefixer = require('gulp-autoprefixer'),
      group_media = require('gulp-group-css-media-queries'),
      clean_css = require('gulp-clean-css'),
      gulp_rename = require('gulp-rename'),
      uglify = require('gulp-uglify-es').default,
      imagemin = require('gulp-imagemin'),
      webp = require('gulp-webp'),
      webphtml = require('gulp-webp-html'),
      webpcss = require('gulp-webpcss'),
      svgSprite = require('gulp-svg-sprite'),
      ttf2woff = require('gulp-ttf2woff'),
      ttf2woff2 = require('gulp-ttf2woff2'),
      fonter = require('gulp-fonter'),
      babel_gulp = require('gulp-babel')

function browserSync() {
  browsersync.init({
    server: {
      baseDir: "./" + project_folder + "/"
    },
    port: 3000,
    notify: false
  })
}

function clean() {
  return del(path.clean);
}

function cb() {

}

function fontsStyle() {
  let file_content = fs.readFileSync(source_folder + '/scss/fonts.scss');
  if (file_content == '') {
    fs.writeFile(source_folder + '/scss/fonts.scss', '', cb);
    return fs.readdir(path.build.fonts, function (err, items) {
      if (items) {
        let c_fontname;
        for (var i = 0; i < items.length; i++) {
          let fontname = items[i].split('.');
          fontname = fontname[0];
          if (c_fontname != fontname) {
            fs.appendFile(source_folder + '/scss/fonts.scss', '@include font("' + fontname + '", "' + fontname + '", "400", "normal");\r\n', cb);
          }
          c_fontname = fontname;
        }
      }
    })
  }
}

function fonts() {
  src(path.src.fonts)
    .pipe(ttf2woff())
    .pipe(dest(path.build.fonts))
  return src(path.src.fonts)
    .pipe(ttf2woff2())
    .pipe(dest(path.build.fonts))
}

function html() {
  return src(path.src.html)
    .pipe(fileinclude())
    .pipe(webphtml())
    .pipe(dest(path.build.html))
    .pipe(browsersync.stream())
}

function images() {
  return src(path.src.img)
    .pipe(
        webp({
          quality: 70
        })
    )
    .pipe(dest(path.build.img))
    .pipe(src(path.src.img))
    .pipe(imagemin({
      interlaced: true,
      progressive: true,
      optimizationLevel: 5,
      svgoPlugins: [
          {
              removeViewBox: true
          }
      ]
    }))
    .pipe(dest(path.build.img))
    .pipe(browsersync.stream())
}

function js() {
  return src(path.src.js)
    .pipe(fileinclude())
    .pipe(dest(path.build.js))
    .pipe(babel_gulp({
      presets: ['@babel/env']
    }))
    .pipe(uglify())
    .pipe(
      gulp_rename({
      outputStyle: ".min.js"
      })
    )
    .pipe(dest(path.build.js))
    .pipe(browsersync.stream())
}

function css() {
  return src(path.src.css)
    .pipe(
      scss({
        outputStyle: "expanded"
    }))
    .pipe(group_media())
    .pipe(
      autoprefixer({
      cascade: true
    }))
    .pipe(webpcss())
    .pipe(dest(path.build.css))
    .pipe(clean_css())
    .pipe(
      gulp_rename({
        extname: ".min.css"
      }))
    .pipe(dest(path.build.css))
    .pipe(browsersync.stream())
}

gulp.task('otf2ttf', () => {
  return src([source_folder + '/assets/fonts/*.otf'])
    .pipe(fonter({
      formats: ['ttf']
    }))
    .pipe(dest(source_folder + "/assets/fonts/"))
})

gulp.task('svgSprite', () => {
  return gulp.src([source_folder + '/assets/iconsprite/*.svg'])
    .pipe(
      svgSprite({
        mode: {
          stack: {
            sprite: "../icons/icons.svg"
          }
        },
      }
      ))
      .pipe(dest(path.build.img))
})  

function watchFiles() {
  gulp.watch([path.watch.html], html),
  gulp.watch([path.watch.css], css),
  gulp.watch([path.watch.js], js),
  gulp.watch([path.watch.img], images)
}

const build = gulp.series(clean, gulp.parallel(css, html, js, images, fonts), fontsStyle)
const watch = gulp.parallel(build, watchFiles, browserSync)

exports.fontsStyle = fontsStyle
exports.fonts = fonts
exports.images = images
exports.js = js
exports.css = css
exports.build = build
exports.html = html
exports.watch = watch
exports.default = watch