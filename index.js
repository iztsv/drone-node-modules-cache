const { existsSync, mkdirSync, readFileSync } = require("fs");
const { dirname } = require('path');
const { execSync } = require('child_process');
const { createHash } = require("crypto");

const { 
  PLUGIN_PACKAGE_JSON,
  PLUGIN_POSTINSTALL,
  PLUGIN_NPM_CACHE,
  PLUGIN_REGISTRY,
  DRONE_REPO_OWNER,
  DRONE_REPO_NAME,
  DRONE_JOB_NUMBER,
  DRONE_COMMIT_MESSAGE
} = process.env;
const CACHE_FOLDER = `/cache/${DRONE_REPO_OWNER}/${DRONE_REPO_NAME}/${DRONE_JOB_NUMBER}/node-modules-cache`;
const EXEC_OPTIONS = { encoding: 'utf-8' };

if (DRONE_COMMIT_MESSAGE.indexOf('[NMC-CLEAR-CACHE]') !== -1) {
  console.info(`=== CLEAR CACHE FOLDER: ${CACHE_FOLDER} ===`);
  console.info(execSync(`rm -rf ${CACHE_FOLDER}/*`, EXEC_OPTIONS));
}

if (!existsSync(CACHE_FOLDER)) {
  console.info(`=== CREATE CACHE FOLDER: ${CACHE_FOLDER} ===`);
  mkdirSync(CACHE_FOLDER, { recursive: true })
}

const packageJsonFile = readFileSync(PLUGIN_PACKAGE_JSON);
const sha1sum = createHash('sha1').update(packageJsonFile).digest("hex");
const archiveName = `${sha1sum}.tar.gz`;
const archivePath = `${CACHE_FOLDER}/${archiveName}`;
const packageJsonFolder = `${dirname(PLUGIN_PACKAGE_JSON)}`;
const nodeModulesPath = `${packageJsonFolder}/node_modules`;

if (!existsSync(archivePath)) {
  console.info('=== NO CACHE! ===');
  console.info(`=== INSTALL NODE_MODULES FOR ${PLUGIN_PACKAGE_JSON} ===`);

  if (PLUGIN_NPM_CACHE) {
    console.info(`=== NPM SET CACHE ${PLUGIN_NPM_CACHE} ===`);
    execSync(`npm set cache ${PLUGIN_NPM_CACHE}`);
  }

  if (PLUGIN_REGISTRY) {
    console.info(`=== NPM SET REGISTRY ${PLUGIN_REGISTRY} ===`);
    execSync(`npm set registry ${PLUGIN_REGISTRY}`);
  }

  console.info('=== NPM CI... ===');
  let execResult = execSync('npm ci', {...EXEC_OPTIONS, cwd: packageJsonFolder });
  console.info(execResult);

  if (PLUGIN_POSTINSTALL) {
    console.info('=== NPM RUN POSTINSTALL... ===');
    execResult = execSync('npm run postinstall', {...EXEC_OPTIONS, cwd: packageJsonFolder });
    console.info(execResult);
  }

  console.info(`=== ARCHIVE NODE_MODULES TO ${archivePath}... ===`);
  execResult = execSync(`tar --use-compress-program="pigz -k --fast" -cf ${archiveName} -C ${nodeModulesPath} .`, EXEC_OPTIONS);
  console.info(execResult);

  execSync(`mv ${archiveName} ${CACHE_FOLDER}`);
} else {
  console.info(`=== RESTORE NODE_MODULES FROM CACHE: ${archivePath} ===`);
  mkdirSync(nodeModulesPath)
  execResult = execSync(`tar -I pigz -xf ${archivePath} -C ${nodeModulesPath}`, EXEC_OPTIONS);
  console.info(execResult);
}
