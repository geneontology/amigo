# Provision Locally

## Requirements 

- The steps below were successfully tested using:
    - Ansible   (2.10.7) Python (3.8.5)

#### DNS 

You can just add two records to /etc/hosts.

The two hostnames specified by these records will be used by the apache proxy 
to forward traffic to either solr or to the amigo server.  

Replace variables AMIGO_DYNAMIC and AMIGO_PUBLIC_GOLR with the hostnames accordingly in vars.tf.

Note: These values can also be passed using the -e option. 


#### Stage Locallay

Clone the repo, build the docker image and finally copy the all templates such docker-compose.yaml 

```sh
cd provision

// Make sure this is an abosulte path.
export STAGE_DIR=/home/ubuntu/stage_dir

// Using this repo and master branch
ansible-playbook -e "stage_dir=$STAGE_DIR" -u ubuntu -i "localhost," --connection=local build_image.yaml 
ansible-playbook -e "stage_dir=$STAGE_DIR" -u ubuntu -i "localhost," --connection=local stage.yaml 

// Or to specify a forked repo and different branch ...
ansible-playbook -e "stage_dir=$STAGE_DIR" -e "repo=https://github.com/..." -e "branch=..." -u ubuntu -i "localhost," --connection=local build_image.yaml 
ansible-playbook -e "stage_dir=$STAGE_DIR" -e "repo=https://github.com/..." -e "branch=..." -u ubuntu -i "localhost," --connection=local stage.yaml 
```

#### Start Docker Instance: 

Start the instance and access it using browser at http://{{ AMIGO_DYNAMIC }}/amigo

```
ssh -o StrictHostKeyChecking=no -i $PRIVATE_KEY ubuntu@$HOST
docker-compose -f docker-compose.yaml up -d

// Tail logs, bring down, delete containers
docker-compose -f docker-compose.yaml logs -f  
docker-compose -f docker-compose.yaml down
docker-compose -f docker-compose.yaml rm -f
```

#### Accessing Containers

```sh
// List containers.
docker ps

// Amigo
docker exec -it amigo /bin/bash

// Proxy
docker exec -it apache_amigo /bin/bash
```

#### Destroy AWS instance:

Destroy when done.

Note: The terraform state is stored in the directory aws. 
      Do not lose it or delete it

```
terraform -chdir=aws destroy
```
