# Amigo Production Deployment


This repository enables the deployment of the amigo stack to AWS. It includes 
amigo and golr.    

## Important ansible files:
- vars.yaml
- stage.yaml
- start_services.yaml
  
## Artifacts Deployed To Staging directory On AWS:
  - Cloned repositories: amigo
  - s3 credentials used to push apache logs to s3 buckets and to download ssl credentials from s3 bucket
  - docker-production-compose and various configuration files from template directory

## Requirements
- Terraform. Tested using v1.1.4 and v1.3.3
- Ansible. Tested using version 2.13.5 and 2.13.7 
- aws-cli/1.22.34 and aws-cli/2.1.17
- python >=3.8

## Development Environment

<b>We have a docker based dev environment with all these tools installed.</b> See last section of this README (Appendix I: Development Environment).

The instructions in this document are run from the POV that we're working with this developement environment; i.e.:
```
docker run --name go-dev -it geneontology/go-devops-base:tools-jammy-0.4.1  /bin/bash
git clone https://github.com/geneontology/amigo
cd amigo/provision
```

## Install Python deployment Script. Skip if using Dev Environment
Note the script has a <b>-dry-run</b> option. You can always copy the command and execute manually
Useful to run the ansible playbooks. 

```
>pip install go-deploy==0.4.1 # requires python >=3.8
>go-deploy -h
```

## S3 Terraform Backend

We use S3 terraform backend to store terraform's state. See production/backend.tf.sample

## DNS 

DNS records are used for amigo and golr. Once the instance has been provisioned, you would need to point these to elastic ip of the VM. For testing purposes you can use aes-test-amigo.geneontology.io for amigo and aes-test-golr.geneontology.io for golr. Once you deploy the VM and have the public ip address go to AWS Route 52 and modify the A records to point to the VM's public IP address

## SSH Keys
For testing purposes you can you your own ssh keys. But for production please ask for the go ssh keys.

## Prepare The AWS Credentials

The credentials are need by terraform to provision the AWS instance and are used by the provisioned instance to access the s3 bucket used as a certificate store and for apache logs. One could also copy in from an existing credential set, see Appendix I at the end for more details.

- [ ] Copy and modify the aws credential file to the default location `/tmp/go-aws-credentials` <br/>`cp production/go-aws-credentials.sample /tmp/go-aws-credentials`
- [ ] You will need to supply an `aws_access_key_id` and `aws_secret_access_key`. These will be marked with `REPLACE_ME`.

## Prepare And Initialize The S3 Terraform Backend

The S3 backend is used to store the terraform state.

Check list:
- [ ] Assumes you have prepared the aws credentials above.
- [ ] Copy the backend sample file <br/>`cp ./production/backend.tf.sample ./aws/backend.tf`
- [ ] Make sure you have the correct s3 bucket configured in the bakend file <br/>`cat ./aws/backend.tf `
- [ ] Execute the command set right below in "Command set".

<b>Command set</b>:

```
# Use the aws cli to make sure you have access to the terraform s3 backend bucket

export AWS_SHARED_CREDENTIALS_FILE=/tmp/go-aws-credentials
aws s3 ls s3://REPLACE_ME_WITH_TERRAFORM_BACKEND_BUCCKET # S3 bucket
go-deploy -init --working-directory aws -verbose
```

## Workspace Name

Use these commands to figure out the name of an existing workspace if any. The name should have a pattern `production-YYYY-MM-DD`

Check list:

- [ ] Assumes you have initialized the backend. See above
```
go-deploy --working-directory aws -list-workspaces -verbose
```

## Provision Instance on AWS

We only need to provision the AWS instance once. This is because we
only want one instance to manage the wildcard certificates. Use the
terraform commands shown above to figure out the name of an existing
workspace. If such workspace exists, then you can skip the
provisionning of the aws instance. Or you can destroy the aws instance
and re-provision if that is the intent.

Check list:
- [ ] <b>Choose your workspace name. We use the following pattern `production-YYYY-MM-DD`</b>. For example: `production-2023-01-30`.
- [ ] Copy `production/config-instance.yaml.sample` to another location and modify using vim or emacs.
- [ ] Verify the location of the ssh keys for your AWS instance in your copy of `config-instance.yaml` under `ssh_keys`.
- [ ] Verify location of the public ssh key in `aws/main.tf`
- [ ] Remember you can use the -dry-run and the -verbose options to test "go-deploy"
- [ ] Execute the command set right below in "Command set".
- [ ] Note down the ip address of the aws instance that is created. This can also be found in production-YYYY-MM-DD.cfg

<b>Command set</b>:
```
cp ./production/config-instance.yaml.sample config-instance.yaml
cat ./config-instance.yaml   # Verify contents and modify if needed.
export ANSIBLE_HOST_KEY_CHECKING=False
go-deploy --workspace production-YYYY-MM-DD --working-directory aws -verbose --conf config-instance.yaml

# The previous command creates a terraform tfvars. These variables override the variables in `aws/main.tf`
cat production-YYYY-MM-DD.tfvars.json

# The previous command creates a ansible inventory file.
cat production-YYYY-MM-DD-inventory.cfg

# Useful terraform commands to check what you have just done
terraform -chdir=aws workspace show   # current terraform workspace
terraform -chdir=aws show             # current state deployed ...
terraform -chdir=aws output           # public ip of aws instance
```

## Deploy Stack to AWS

Check list:
- [ ] <b>Make DNS names for golr and amigo point to public ip address on AWS Route 53.</b> 
- [ ] Location of SSH keys may need to be replaced after copying config-stack.yaml.sample
- [ ] s3 credentials are placed in a file using format described above
- [ ] s3 uri if ssl is enabled. Location of ssl certs/key (S3_SSL_CERTS_LOCATION)
- [ ] Use same workspace name as in previous step
- [ ] Remember you can use the -dry-run option
- [ ] Optional When Testing: change dns names in the config file for noctua, barista, and golr. 
- [ ] Execute the command set right below in "Command set".

<b>Command set</b>:

```
cp ./production/config-stack.yaml.sample ./config-stack.yaml
cat ./config-stack.yaml    # Verify contents and modify if needed.
export ANSIBLE_HOST_KEY_CHECKING=False
go-deploy --workspace production-YYYY-MM-DD --working-directory aws -verbose --conf config-stack.yaml
```

## Access amigo from a browser

Check list:
- [ ] amigo is up and healthy. We use health checks in docker compose file
- [ ] Use amigo dns name. http://{{ AMIGO_DYNAMIC }}/amigo

## Debugging

- ssh to machine. username is ubuntu. Try using dns names to make sure they are fine
- docker-compose -f stage_dir/docker-compose.yaml ps
- docker-compose -f stage_dir/docker-compose.yaml down # whenever you make any changes 
- docker-compose -f stage_dir/docker-compose.yaml up -d
- docker-compose -f stage_dir/docker-compose.yaml logs -f 
- Use -dry-run and copy and paste the command and execute it manually

## Destroy Instance and Delete Workspace.

```sh
# Make sure you pointing to the correct workspace before destroying the stack.
terraform -chdir=aws workspace list
terraform -chdir=aws workspace select <name_of_workspace>
terraform -chdir=aws workspace show # shows the name of current workspace
terraform -chdir=aws show           # shows the state you are about to destroy
terraform -chdir=aws destroy        # You would need to type Yes to approve.

# Now delete workspace.
terraform -chdir=aws workspace select default # change to default workspace
terraform -chdir=aws workspace delete <name_of_workspace>  # delete workspace.
```

## Appendix I: Development Environment

```
# Start docker container `go-dev` in interactive mode.
docker run --rm --name go-dev -it geneontology/go-devops-base:tools-jammy-0.4.1  /bin/bash

# In the command above we used the `--rm` option which means the container will be deleted when you exit. If that is not
# the intent and you want delete it later at your own convenience. Use the following `docker run` command.

docker run --name go-dev -it geneontology/go-devops-base:tools-jammy-0.4.1  /bin/bash

# Exit or stop the container.
docker stop go-dev  # stop container with the intent of restarting it. This equivalent to `exit` inside the container

docker start -ia go-dev  # restart and attach to the container
docker rm -f go-dev # get rid of it for good when ready.
```

SSH/AWS Credentials:

Use `docker cp` to copy these credentials to /tmp. You can also copy and paste using your favorite editor vim or emacs.

Under /tmp you would need the following:

- /tmp/go-aws-credentials
- /tmp/go-ssh
- /tmp/go-ssh.pub

```
# Example using `docker cp` to copy files from host to docker container named `go-dev`

docker cp <path_on_host> go-dev:/tmp/
```

Then, within the docker image:

```
chown root /tmp/go-*
chgrp root /tmp/go-*
```

