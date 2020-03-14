// include plug-ins:
// SERVE: BrowserSync
const gulp = require("gulp");
const browserSync = require("browser-sync").create();

const { reload } = browserSync;

// html + img
const nunjucksRender = require("gulp-nunjucks-render");
const data = require("gulp-data");
const htmlclean = require("gulp-htmlclean");
const imagemin = require("gulp-imagemin");

// css
const sass = require("gulp-sass");
const sassGlob = require("gulp-sass-glob");
const sourcemaps = require("gulp-sourcemaps");
const postcss = require("gulp-postcss");
const cssnano = require("cssnano");
const postcssPresetEnv = require("postcss-preset-env");
const postcssCustomProperties = require("postcss-custom-properties");
const postcssdiscardDuplicates = require("postcss-discard-duplicates");
const resembleImage = require('postcss-resemble-image').default;
// const purgecss = require('gulp-purgecss'); //https://www.purgecss.com/with-gulp
// const postcsseasingradients = require("postcss-easing-gradients");
const plugins = [
  resembleImage(),
  postcssPresetEnv({
    stage       : 0,
    autoprefixer: { grid: true },
  }),
  postcssdiscardDuplicates(),
  postcssCustomProperties(),
  cssnano(),
];

// other
const fs = require("fs");
const gzip = require('gulp-gzip');
const newer = require("gulp-newer");
const rename = require('gulp-rename');
const compress = require('compression');
const gulpSequence = require('gulp-sequence');
// js
const webpack = require("webpack");
const webpackStream = require("webpack-stream");
const webpackConfig = require("./webpack.config.js");
const webpackProd = require("./webpack.prod.js");

// FOLDERS :
const srcHTML = "src/html/*.njk";
const srcSASS = "src/scss/index.scss";
const srcJS = "src/js/index.js";
const srcIMG = "src/images/**/*";

const outSASS = "src/assets";
const outJS = "src/assets";

const watchHTML = "src/html/**/**/*";
const watchSASS = "src/scss/**/*.scss";
const watchJS = "src/js/**/*.js";

const destHTML = "docs";
const destCSS = "docs/assets";
const destJS = "docs/assets";
const destIMG = "docs/img";
// ========================================
const PORT = 7000;
const PORT_BUILD = 7700;
// ERROR function
function swallowError(error) {
  // eslint-disable-next-line no-console
  console.log(error.toString());
  this.emit("end");
}
function serverStart() {
  browserSync.init({
    // will not try to determine if am online online: false
    online: true,
    server: {
      baseDir   : "./src",
      middleware: [compress()],
    },
    port: `${PORT}`,
    // don't auto-reload all browsers following a Browsersync restart
    // reloadOnRestart: false,
    // open: false,
  });
}
function serverForBuild() {
  browserSync.init({
    online: true,
    server: {
      baseDir   : "./docs",
      middleware: [compress()],
    },
    port           : `${PORT_BUILD}`,
    reloadOnRestart: true,
  });
}

function sassTocss() {
  return gulp
    .src(srcSASS)
    .pipe(sourcemaps.init({ loadMaps: true }))
    .pipe(sassGlob())
    .pipe(sass().on("error", sass.logError))
    .pipe(rename('app.css'))
    .pipe(sourcemaps.write("."))
    .pipe(gulp.dest(outSASS));
}


function minifyHtml() {
  return gulp
    .src(srcHTML)
    .pipe(nunjucksRender({ path: "src/html" }))
    .on("error", swallowError)
    .pipe(gulp.dest("./src/"))
    .pipe(
      htmlclean({
        protect: /<!--%fooTemplate\b.*?%-->/g,
        edit(html) {
          return html.replace(/\begg(s?)\b/gi, "omelet$1");
        },
      }),
    )
    .pipe(gulp.dest(destHTML))
    .pipe(browserSync.stream());
}

function minifyJs() {
  return gulp
    .src(srcJS)
    .pipe(
      webpackStream(webpackConfig),
      webpack,
    )
    .on("error", swallowError)
    .pipe(gulp.dest(outJS))
    .pipe(browserSync.stream());
}

// function serviceWorker() {
//   return gulp
//     .src("src/sw.js")
//     .pipe(uglify())
//     .pipe(gulp.dest("docs"))
//     .pipe(browserSync.stream());
// }

function minifyImg() {
  return gulp
    .src(srcIMG)
    .pipe(newer(destIMG))
    .pipe(imagemin())
    .on("error", swallowError)
    .pipe(gulp.dest(destIMG))
    .pipe(browserSync.stream());
}

// ----------------build-----------------
function css() {
  return gulp
    .src("src/assets/app.css")
    .pipe(postcss(plugins))
    .pipe(gulp.dest(destCSS))
    .pipe(gzip())
    .pipe(gulp.dest(destCSS));
}
function jsToDocs() {
  return gulp
    .src("src/assets/app.js")
    .pipe(
      webpackStream(webpackProd),
      webpack,
    ).on("error", swallowError)
    .pipe(gulp.dest(destJS));
}

// watch .....................................
function watchChange() {
  gulp.watch(srcIMG, ["minify-img", reload]);
  gulp.watch(watchHTML, ["html", reload]);
  gulp.watch("src/data.json", ["html", reload]);
  gulp.watch(watchSASS, ["sass", reload]);
  gulp.watch(watchJS, ["scripts", reload]);
  // gulp.watch("src/sw.js", ["sw", reload]);
}

// -----------assign task name-------------
gulp.task("html", minifyHtml);
gulp.task("sass", sassTocss);
gulp.task("scripts", minifyJs);
gulp.task("minify-img", minifyImg);
gulp.task("serve", serverStart);
gulp.task('watch', watchChange);
// gulp.task("sw", serviceWorker);
gulp.task("seq", gulpSequence('html', 'minify-img', 'sass', 'scripts', 'serve'));
// run by npm run gulp: will run this default function
gulp.task("default", ['seq'], watchChange);

gulp.task("buildCss", css);
gulp.task("buildJs", jsToDocs);
gulp.task("buildServer", serverForBuild);
gulp.task("build", gulpSequence('buildCss', 'buildJs', 'buildServer'));
// ...............................................................
