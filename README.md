# drone-node-modules-cache

## Docker

Build the docker image by running:

```bash
docker build --rm=true -t ilyaztsv/drone-node-modules-cache .
```

## Usage

Execute from the working directory:

```bash
docker run --rm \
  -e PLUGIN_NPM_CACHE="./npm-cache" \
  -e PLUGIN_REGISTRY="http://own-npm-registry.ru" \
  -e PLUGIN_PACKAGE_JSON="./package.json" \
  -e PLUGIN_POSTINSTALL=true \
  -e DRONE_REPO_OWNER="foo" \
  -e DRONE_REPO_NAME="bar" \
  -e DRONE_JOB_NUMBER=0 \
  -v $(pwd):$(pwd) \
  -v /tmp/cache:/cache \
  -w $(pwd) \
  ilyaztsv/drone-node-modules-cache
```

or in drone-pipeline:

```bash
install-node-modules:
  group: prepare
  image: ilyaztsv/drone-node-modules-cache
  network_mode: host
  npm_cache: ./npm-cache
  registry: http://own-npm-registry.ru
  package_json: ./package.json
  postinstall: true
  volumes:
    - /tmp/cache:/cache
```
