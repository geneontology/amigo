# New AmiGO Deployment Instructions

Note: uniformly replace `YYYY-MM-DD` with the date that you start
these instructions.

## Dev docker setup

Starting fresh:

```bash
docker rm amigo-devops || true && docker run --name amigo-devops -it geneontology/go-devops-base:tools-jammy-0.4.4 /bin/bash
cd /tmp
git clone https://github.com/geneontology/amigo.git
cd amigo/provision
```

If rejoining after having done this prep:

```bash
docker container start amigo-devops
docker exec -it amigo-devops bash -c "/bin/bash"
cd /tmp/amigo/provision
```

Test with:
```bash
go-deploy -h
```

From "outside" docker image, get deployment keys into place:

```bash
docker cp go-ssh amigo-devops:/tmp
docker cp go-ssh.pub amigo-devops:/tmp
```

Back "inside":

```bash
chmod 600 /tmp/go-ssh*
```

## AWS credentials setup for instance creation

Edit AWS credentials:

```bash
cp production/go-aws-credentials.sample /tmp/go-aws-credentials
emacs -nw /tmp/go-aws-credentials
```

Add your personal dev keys into the file (Prerequisites 1), update the `aws_access_key_id` and `aws_secret_access_key`, then:

```bash
export AWS_SHARED_CREDENTIALS_FILE=/tmp/go-aws-credentials
export ANSIBLE_HOST_KEY_CHECKING=False
```

Test with:

```bash
aws s3 ls s3://go-workspace-amigo
```

Setup Terraform backend:

```bash
cp ./production/backend.tf.sample ./aws/backend.tf
emacs -nw ./aws/backend.tf
```

- `REPLACE_ME_AMIGO_S3_BACKEND` should be `go-workspace-amigo`.

```bash
go-deploy -init --working-directory aws -verbose
```

Test with:

```bash
go-deploy --working-directory aws -list-workspaces -verbose
```

## Provision instance for AmiGO in AWS

```bash
cp ./production/config-instance.yaml.sample config-instance.yaml
emacs -nw config-instance.yaml
```

- `REPLACE_ME`
  - If production, should be `amigo-production-YYYY-MM-DD`
  - If development, should be `amigo-development-YYYY-MM-DD`
- `REPLACE_ME_FQDN_FOR_AMIGO`
  - If production, should be `amigo-production-YYYY-MM-DD.geneontology.org`
  - If development, should be `amigo-development-YYYY-MM-DD.geneontology.io`
- `REPLACE_ME_FQDN_FOR_GOLR`
  - If production, should be `golr-production-YYYY-MM-DD.geneontology.org`
  - If development, should be `golr-development-YYYY-MM-DD.geneontology.io`
- `REPLACE_ME_FOR_DNS_ZONE_ID`
  - If production (geneontology.org), should be `Z04640331A23NHVPCC784`
  - If development (geneontology.io), should be `Z1SMAYFNVK75BZ`

Deploy:

If production (geneontology.org):

```bash
go-deploy --workspace amigo-production-YYYY-MM-DD --working-directory aws -verbose --conf config-instance.yaml
```

If development (geneontology.io):

```bash
go-deploy --workspace amigo-development-YYYY-MM-DD --working-directory aws -verbose --conf config-instance.yaml
```

To test, note public IP address in output and try:

```bash
ssh -i /tmp/go-ssh ubuntu@PUBLIC_IP
go-deploy --working-directory aws -list-workspaces -verbose
```

## Setup and start AmiGO/GOlr in AWS instance

```bash
emacs -nw ansible/hosts.amigo
```

- `REPLACE_ME`
  - Should be IP address of new EC2 instance from above

```bash
emacs -nw ansible/amigo-golr-setup.yml
```

- `amigo_version`
  - Should likely be "master"
- `amigo_url_string`
  - https://amigo-development-YYYY-MM-DD.geneontology.io
- `golr_url_string`
  - https://golr-development-YYYY-MM-DD.geneontology.io
- `golr_aux_url_string`
  - https://golr-development-YYYY-MM-DD.geneontology.io
- `amigo_version_note`
  - amigo-development-YYYY-MM-DD
- `mapping_host`
  - amigo-development-2025-03-06.geneontology.io
- `mapping_host`
  - golr-development-2025-03-06.geneontology.io

[At this point in time, also convert https to http.]

Then run ansible:

```bash
ansible-playbook ansible/amigo-golr-setup.yml --inventory=ansible/hosts.amigo --private-key="/tmp/go-ssh" -e target_host=amigo-in-aws -e target_user=ubuntu
```

## Load GOlr w/data

In geneontology/operations/ansible:

add target (amigo-noctua-dev) with IP above into (new) hosts.neo:

```
ansible-playbook update-golr-w-skyhook-forced.yaml --inventory=hosts.neo --private-key=/home/sjcarbon/local/share/secrets/go/ssh-keys/go-ssh -e target_branch=issue-35-neo-test -e target_host=amigo-noctua-dev -e target_user=ubuntu
```
## Setup HTTPS

Currently, have to accept both "iffy" celf-signed certs before using
AmiGO/GOlr.

TODO: hook through cloudflare.


## Destroy Instance and Delete Workspace.

```sh
Make sure you are deleting the correct workspace.
go-deploy --workspace amigo-development-YYYY-MM-DD --working-directory aws -verbose -show

# Destroy.
go-deploy --workspace amigo-development-YYYY-MM-DD --working-directory aws -verbose -destroy
```

STOP





# AmiGO Production Deployment

This part of the repository enables the deployment of the AmiGO stack
to AWS. It includes amigo and golr.

# Overview & Discussion

## Important ansible files:

- vars.yaml
- stage.yaml
- start_services.yaml

## Artifacts Deployed To Staging directory On AWS:

- Cloned repositories: amigo
- S3 credentials used to push apache logs to S3 buckets and to download ssl credentials from a pre-determined S3 bucket.
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
docker run --name amigo-devops -it geneontology/go-devops-base:tools-jammy-0.4.4 /bin/bash
apt-get update && apt-get dist-upgrade
git clone https://github.com/geneontology/amigo
cd amigo/provision
```

## Install the Python deployment script (skip if using as dev environment)

Note the script has a <b>-dry-run</b> option. You can always copy the command and execute manually.

```
>pip install go-deploy==0.4.2 # requires python >=3.8
>go-deploy -h
```

## S3 Terraform Backend

We use the Terraform S3 backend to store terraform's state. See
backend.tf.sample.

## DNS

Note: DNS records are used for amigo and golr. The tool would create them during `create phase` and destroy them during `destroy phase`. See `dns_record_name` in the instance config file and `AMIGO_DYNAMIC` and `AMIGO_PUBLIC_GOLR` in the stack config file.

The aliases `AMIGO_DYNAMIC_ALIAS` and `AMIGO_PUBLIC_GOLR_ALIAS` should be FQDN of EXISTING DNS records.
They should NOT be managed by the tool otherwise the tool would delete them during the `destroy phase`.

Once the instance has been provisioned and tested, the aliases would need to modified manually and point to the public ip address of the vm.

## SSH Keys

For testing purposes you can you your own ssh keys. But for production
please ask for the go ssh keys.

# Instructions

## Prepare The AWS Credentials

The credentials are need by terraform to provision the AWS instance and are used by the provisioned instance to access the s3 bucket used as a certificate store and for apache logs. One could also copy in from an existing credential set, see Appendix I at the end for more details.

- [ ] Copy and modify the aws credential file to the default location `/tmp/go-aws-credentials` <br/>`cp ./production/go-aws-credentials.sample /tmp/go-aws-credentials`
- [ ] You will need to supply values for `aws_access_key_id` and `aws_secret_access_key` in `/tmp/go-aws-credentials`. These will be marked with `REPLACE_ME`.

## Prepare And Initialize The S3 Terraform Backend

The S3 backend is used to store the terraform state.

Check list:
- [ ] Assumes you have prepared the AWS credentials above.
- [ ] Copy the backend sample file <br/>`cp ./production/backend.tf.sample ./aws/backend.tf`
- [ ] Make sure you have the correct S3 bucket configured in the backend file <br/>`cat ./aws/backend.tf`; replace `REPLACE_ME_AMIGO_S3_BACKEND` as needed: `go-workspace-amigo`. If this is a production environment, coordinate the location of this common-state bucket.
- [ ] Execute the command set right below in "Command set".

<b>Command set</b>:

```
# Use the aws cli to make sure you have access to the terraform s3 backend bucket

export AWS_SHARED_CREDENTIALS_FILE=/tmp/go-aws-credentials
aws s3 ls s3://REPLACE_ME_AMIGO_S3_BACKEND # S3 bucket from previous step
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
- [ ] <b>Choose your workspace name. We use the following pattern `production-YYYY-MM-DD`</b>. For example: `production-2023-01-30` or `neo-2024-12-06`.
- [ ] Copy `production/config-instance.yaml.sample` to another location and modify using vim or emacs. E.g. `cp production/config-instance.yaml.sample ./config-instance.yaml`.
- [ ] Verify the location of the ssh keys for your AWS instance in your copy of `config-instance.yaml` under `ssh_keys`. E.g `docker cp ~/LOCATION/ssh amigo-devops:/tmp/` and `docker cp ~/LOCATION/ssh.pub amigo-devops:/tmp/`.
- [ ] Verify location of the public ssh key in `aws/main.tf`, if different than default.
- [ ] Remember you can use the -dry-run and the -verbose options to test "go-deploy"
- [ ] Execute the command set right below in "Command set".
- [ ] Note down the ip address of the aws instance that is created. This can also be found in newly created `production-YYYY-MM-DD-inventory.cfg`.

<b>Command set</b>:
```
cp ./production/config-instance.yaml.sample config-instance.yaml # if not already done
cat ./config-instance.yaml   # verify contents and modify if needed.
export ANSIBLE_HOST_KEY_CHECKING=False

# Deploy command.
go-deploy --workspace production-YYYY-MM-DD --working-directory aws -verbose --conf config-instance.yaml

# Display the terraform state
go-deploy --workspace production-YYYY-MM-DD --working-directory aws -verbose -show

# Display the public ip address of the aws instance.
go-deploy --workspace production-YYYY-MM-DD --working-directory aws -verbose -output

#Useful Information When Debugging.
# The deploy command creates a terraform tfvars. These variables override the variables in `aws/main.tf`
cat production-YYYY-MM-DD.tfvars.json

# The Deploy command creates a ansible inventory file.
cat production-YYYY-MM-DD-inventory.cfg
```

## Deploy Stack to AWS

Check list:
- [ ] <b>Check that DNS names for golr and amigo map point to public ip address on AWS Route 53.</b>
- [ ] Location of SSH keys may need to be replaced after copying `production/config-stack.yaml.sample` from the above steps.
- [ ] S3 credentials are placed in a file using format described above.
- [ ] S3 URI if SSL is enabled. Location of ssl certs/key (S3\_SSL\_CERTS\_LOCATION)
- [ ] Use same workspace name as in previous step
- [ ] Remember you can use the -dry-run option
- [ ] Optional When Testing: change dns names in the config file for noctua, barista, and golr.
- [ ] Execute the command set right below in "Command set".

<b>Command set</b>:

```
cp ./production/config-stack.yaml.sample ./config-stack.yaml
cat ./config-stack.yaml    # Verify contents and modify as needed, search for REPLACE_ME.
export ANSIBLE_HOST_KEY_CHECKING=False
go-deploy --workspace production-YYYY-MM-DD --working-directory aws -verbose --conf config-stack.yaml
```

As a note, running this last set took about 20min to complete. The
stack spinning up to functionality took another few minutes, so please
be patient.

## Access AmiGO from a browser

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

## Appendix I: Development Environment

```
# Start docker container `amigo-devops` in interactive mode.
docker run --rm --name amigo-devops -it geneontology/go-devops-base:tools-jammy-0.4.2  /bin/bash

# In the command above we used the `--rm` option which means the container will be deleted when you exit. If that is not
# the intent and you want delete it later at your own convenience. Use the following `docker run` command.

docker run --name amigo-devops -it geneontology/go-devops-base:tools-jammy-0.4.2  /bin/bash

# Exit or stop the container.
docker stop amigo-devops  # stop container with the intent of restarting it. This equivalent to `exit` inside the container

docker start -ia amigo-devops  # restart and attach to the container
docker rm -f amigo-devops # get rid of it for good when ready.
```

SSH/AWS Credentials:

Use `docker cp` to copy these credentials to /tmp. You can also copy and paste using your favorite editor vim or emacs.

Under /tmp you would need the following:

- /tmp/go-aws-credentials
- /tmp/go-ssh
- /tmp/go-ssh.pub

```
# Example using `docker cp` to copy files from host to docker container named `amigo-devops`

docker cp <path_on_host> amigo-devops:/tmp/
```

Then, within the docker image:

```
chown root /tmp/go-*
chgrp root /tmp/go-*
```
