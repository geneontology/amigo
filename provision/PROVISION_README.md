# Provision Locally

## Requirements

- The steps below were successfully tested using:
    - Ansible   (2.10.7) Python (3.8.5)

#### DNS

You can just add two records to /etc/hosts.

The two hostnames specified by these records will be used by the apache proxy
to forward traffic to either solr or to the amigo server.

Replace variables AMIGO_DYNAMIC and AMIGO_PUBLIC_GOLR with the hostnames accordingly in vars.yaml.

Note: These values can also be passed using the -e option.

```
# /etc/hosts for default values AMIGO_DYNAMIC and AMIGO_PUBLIC_GOLR
# use the ip address of the host machine
# On mac for example use `ipconfig getifaddr en0`
XXX.XXX.XXX.XXX amigo.example.com
XXX.XXX.XXX.XXX amigo-golr.example.com
```

#### About Solr Index

The stage.yaml installs the index under {{ stage_dir }}/srv-solr-data/index.
In vars.yaml, set CREATE_INDEX and change the appropriate variables.

##### Production:  Download index ...
  - CREATE_INDEX=False
  - golr_index_archive_url
  - golr_timestamp
  - release_archive_doi

##### Development: Create Index ...
  - CREATE_INDEX=True
  - GOLR_SOLR_MEMORY
  - GOLR_LOADER_MEMORY
  - GOLR_INPUT_ONTOLOGIES
  - GOLR_INPUT_GAFS

#### LogRotate To AWS S3
  - USE_S3: 1
  - ACCESS_KEY: REPLACE_ME
  - SECRET_KEY: REPLACE_ME
  - S3_BUCKET: REPLACE_ME

#### Stage Locally

Clone the repo, build the docker image and finally copy all template files such as docker-compose.yaml

If using a local staging directory, you may want to add something like `mkdir -p /tmp/stage`.

```sh
cd provision

// Make sure this is an absolute path.
export STAGE_DIR=...

// Using this repo and master branch
ansible-playbook -e "stage_dir=$STAGE_DIR" -i "localhost," --connection=local build_images.yaml
ansible-playbook -e "stage_dir=$STAGE_DIR" -i "localhost," --connection=local stage.yaml
ansible-playbook -e "stage_dir=$STAGE_DIR" -i "localhost," --connection=local start_services.yaml

// Or to specify a forked repo and different branch ...
ansible-playbook -e "stage_dir=$STAGE_DIR" -e "repo=https://github.com/..." -e "branch=..." -i "localhost," --connection=local build_images.yaml
ansible-playbook -e "stage_dir=$STAGE_DIR" -e "repo=https://github.com/..." -e "branch=..." -i "localhost," --connection=local stage.yaml
ansible-playbook -e "stage_dir=$STAGE_DIR" -e "repo=https://github.com/..." -e "branch=..." -i "localhost," --connection=local start_services.yaml
```

#### Start Docker Containers using docker-compose

Start containers golr, amigo and apache_amigo and access amigo using the browser
at http://{{ AMIGO_DYNAMIC }}/amigo   (http://amigo.example.com/amigo if using default AMIGO_DYNAMIC)

Note: apache_amigo is an apache proxy to amigo and golr containers.

```
cd $STAGE_DIR
docker-compose -f docker-compose.yaml up -d

// Note: The amigo container can take some time when started for the first time. Check the amigo logs first and make sure
// it is ready.
docker-compose -f docker-compose.yaml logs -f amigo
```

#### Other useful docker-compose commands

```
// Tail logs of all containers amigo and apache_amigo
docker-compose -f docker-compose.yaml logs -f

// Bring all containers and remove them
docker-compose -f docker-compose.yaml down
```

#### Accessing Containers using docker command

```sh
// List containers.
docker ps

// Amigo
docker exec -it amigo /bin/bash

// Proxy
docker exec -it apache_amigo /bin/bash
```

#### Force Reinstall

During Development one can remove the `amigo_hash` file to force the reinstall of the amigo perl software.
You would need to restart the amigo container.


#### Test LogRotate

Test LogRotate. Use -f option to force log rotation.

```sh
docker exec -it apache_amigo bash
ps -ef | grep cron
ps -ef | grep apache2
cat /opt/credentials/s3cfg
logrotate -v -f /etc/logrotate.d/apache2
```
