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
You way want to check vars.yaml and change the following variables accordingly.
The stage.yaml installs the index under {{ stage_dir }}/srv-solr-data.
If you have the solr index just place it in this location and stage.yaml will skip this step.

  - GOLR_SOLR_MEMORY
  - GOLR_LOADER_MEMORY
  - GOLR_INPUT_ONTOLOGIES
  - GOLR_INPUT_GAFS

#### Stage Locally

Clone the repo, build the docker image and finally copy all template files such as docker-compose.yaml 

```sh
cd provision

// Make sure this is an abosulte path.
export STAGE_DIR=...

// Using this repo and master branch
ansible-playbook -e "stage_dir=$STAGE_DIR" -i "localhost," --connection=local build_image.yaml 
ansible-playbook -e "stage_dir=$STAGE_DIR" -i "localhost," --connection=local stage.yaml 

// Or to specify a forked repo and different branch ...
ansible-playbook -e "stage_dir=$STAGE_DIR" -e "repo=https://github.com/..." -e "branch=..." -i "localhost," --connection=local build_image.yaml 
ansible-playbook -e "stage_dir=$STAGE_DIR" -e "repo=https://github.com/..." -e "branch=..." -i "localhost," --connection=local stage.yaml 
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
