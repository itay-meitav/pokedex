const gulp = require("gulp");
const clean = require("gulp-clean");
const sass = require("gulp-sass")(require("sass"));
const webpack = require("webpack-stream");
const { exec } = require("child_process");
const webpackConfig = require("./webpack.config.js");

function execLog(command = "", cb = undefined) {
  const process = exec(command, cb);
  process.stdout.on("data", console.log);
  process.stdout.on("error", console.log);
}

// Removes previous dist
gulp.task("clean", () => {
  return gulp.src("./dist", { allowEmpty: true }).pipe(clean());
});

// copies all files exept ts and scss
gulp.task("copy-no-transpile-client", () => {
  return gulp
    .src(["client/**/*", "!client/**/*.ts", "!client/**/*.scss"])
    .pipe(gulp.dest("./dist/client/"));
});

gulp.task("copy-no-transpile-server", () => {
  return gulp
    .src(["server/**/*", "!server/**/*.ts"])
    .pipe(gulp.dest("./dist/server/"));
});

// Converts scss to css
gulp.task("transpile-scss", () => {
  return gulp
    .src("./client/**/*.scss")
    .pipe(sass().on("error", sass.logError))
    .pipe(gulp.dest("./dist/client/"));
});

// Watch static files
gulp.task("watch-static", () => {
  return gulp.watch(
    ["src/**/*", "!src/**/*.ts", "!src/**/*.scss"],
    gulp.series("static")
  );
});

// Converts ts to js
gulp.task("transpile-ts", (cb) => {
  execLog("tsc", cb);
});

// Creates/Updates the dist folder
gulp.task(
  "build",
  gulp.series(
    "clean",
    "copy-no-transpile-client",
    "copy-no-transpile-server",
    "transpile-scss",
    "transpile-ts"
  )
);

// Watch static files
gulp.task("watch-static-client", () => {
  return gulp.watch(
    ["client/**/*", "!client/**/*.ts", "!client/**/*.scss"],
    gulp.series("copy-no-transpile-client")
  );
});

gulp.task("watch-static-server", () => {
  return gulp.watch(
    ["server/**/*", "!server/**/*.ts", "!server/**/*.scss"],
    gulp.series("copy-no-transpile-server")
  );
});

// Watch scss files
gulp.task("watch-scss", () => {
  return gulp.watch("./client/**/*.scss", gulp.series("transpile-scss"));
});

// Watch ts files and recompile
gulp.task("watch-ts", () => {
  execLog("tsc -w");
});

// start nodemon
gulp.task("nodemon", () => {
  execLog("nodemon dist/server/server.js");
});

// Watch all files
gulp.task(
  "watch",
  gulp.parallel(
    "watch-static-client",
    "watch-static-server",
    "watch-scss",
    "watch-ts"
  )
);

// Run all together
gulp.task("dev", gulp.series("build", gulp.parallel("watch", "nodemon")));

gulp.task("copy-node-to-dist", () => {
  return gulp
    .src(["./package.json", "./package-lock.json"])
    .pipe(gulp.dest("./dist"));
});

// Creates js bundle from client js files
gulp.task("bundle-client-js", () => {
  return webpack(webpackConfig).pipe(gulp.dest("./dist/client"));
});

gulp.task("clean-client", () => {
  return gulp.src("dist/client/*.js", { read: false }).pipe(clean());
});

// Watch all files
gulp.task(
  "prod",
  gulp.parallel("clean-client", "copy-node-to-dist", "bundle-client-js")
);

gulp.task("deploy", gulp.series("build", "prod"));
