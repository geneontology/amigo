# Provision AWS instance.

## Requirements 

- The steps below were successfully tested using:
    - Terraform (0.14.4)
    - Ansible   (2.10.7) Python (3.8.5)

#### Install Terraform

- Go to [url](https://learn.hashicorp.com/tutorials/terraform/install-cli)

#### AWS Credentials.
- Create a credential file at `~/.aws/credentials` or override the location in aws/provider.tf

```
[default]
aws_access_key_id = XXXX
aws_secret_access_key = XXXX
```
#### SSH Credentials.
- In aws/vars.tf the private key and the public keys are assumed to be in the standard location

```
variable "public_key_path" {
  default = "~/.ssh/id_rsa.pub"
}

variable "private_key_path" {
  default = "~/.ssh/id_rsa"
}

```

#### Elastic Ip

Create elastic ip (VPC) and use its allocation_id aws/vars.tf 

Note: A default elastic ip has already been created for region us-east-1
      It can be used if not associated to an instance. 

```sh
variable eip_alloc_id {
  default = "REPLACE_ME"
}
```

#### DNS 

Need to create two Route53 records pointing to the elastic ip created above.
The two hostnames specified by these records will be used by the apache proxy 
to forward traffic to either solr or to the amigo server.  

Replace variables AMIGO_DYNAMIC and AMIGO_PUBLIC_GOLR with the hostnames accordingly in vars.yaml.

Note: These values can also be passed using the -e option. 


#### Create AWS instance: 

Note: Terraform creates some folders and files to maintain the state. 
      Once terraform is applied, you can see them using <i>ls -a aws</i>

```sh
cd provision

# This will install the aws provider. 
terraform -chdir=aws init

# Validate the terraform scripts' syntax
terraform -chdir=aws validate

# View the plan that is going to be created.
# This is very useful as it will also search for the elastic ip using 
# the supplied eip_alloc_id. And would fail if it does not find it.
terraform -chdir=aws plan

# This will create the vpc, security group and the instance
terraform -chdir=aws apply

# To view the outputs
terraform -chdir=aws output 

#To view what was deployed:
terraform -chdir=aws show 
```

#### Test AWS Instance: 

```sh
export HOST=`terraform -chdir=aws output -raw public_ip`
export PRIVATE_KEY=`terraform -chdir=aws output -raw private_key_path`

ssh -o StrictHostKeyChecking=no -i $PRIVATE_KEY ubuntu@$HOST
docker ps
which docker-compose
```

#### About Solr Index
You way want to check vars.yaml and change the following variables accordingly.
The stage.yaml installs the index under {{ stage_dir }}/srv-solr-data.
If you have the solr index just place it in this location and stage.yaml will skip this step.

  - GOLR_SOLR_MEMORY
  - GOLR_LOADER_MEMORY
  - GOLR_INPUT_ONTOLOGIES
  - GOLR_INPUT_GAFS


#### Stage To AWS Instance: 

Clone the repo on the AWS instance, build the docker image and finally copy the docker-compose file
and other templates. 

```sh
cd provision
export HOST=`terraform -chdir=aws output -raw public_ip`
export PRIVATE_KEY=`terraform -chdir=aws output -raw private_key_path`

// Make sure this is an abosulte path.
export STAGE_DIR=/home/ubuntu/stage_dir

// Using this repo and master branch
ansible-playbook -e "stage_dir=$STAGE_DIR" -u ubuntu -i "$HOST," --private-key $PRIVATE_KEY build_image.yaml 
ansible-playbook -e "stage_dir=$STAGE_DIR" -u ubuntu -i "$HOST," --private-key $PRIVATE_KEY stage.yaml 

// Or to specify a forked repo and different branch ...
ansible-playbook -e "stage_dir=$STAGE_DIR" -e "repo=https://github.com/..." -e "branch=..." -u ubuntu -i "$HOST," --private-key $PRIVATE_KEY build_image.yaml 
ansible-playbook -e "stage_dir=$STAGE_DIR" -e "repo=https://github.com/..." -e "branch=..." -u ubuntu -i "$HOST," --private-key $PRIVATE_KEY stage.yaml 
```

#### Start Docker Containers: 

Start Containers and access amigo using the browser at http://{{ AMIGO_DYNAMIC }}/amigo

```
ssh -o StrictHostKeyChecking=no -i $PRIVATE_KEY ubuntu@$HOST
// cd to stage_dir ....
docker-compose -f docker-compose.yaml up -d

// Tail logs, bring down, delete containers
docker-compose -f docker-compose.yaml logs -f  
docker-compose -f docker-compose.yaml down
```

#### Accessing Containers

```sh
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


