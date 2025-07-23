# New AmiGO Deployment Instructions

Note: uniformly replace `YYYY-MM-DD` with the date that you start
these instructions.

## Devops docker setup

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

As well as AWS bucket credentials:

```bash
docker cp aws-go-push.awscred amigo-devops:/tmp/aws-go-push.awscred
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

The default machine and disk size here (t2.large and 200GB) is for a
functional and updatable installation of NEO (with some disk
leftover). Other AmiGO loads are going to have different profiles. In
the future, we can add them here. In addition to the items to be
modified below, a different AmiGO load can be supported by changing
the `instance_type` and `disk_size` variables in config-instance.yaml.

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

## Setup hosts for ansible

Go back to /tmp/amigo/production/ansible.

```bash
cd /tmp/amigo/provision/ansible
emacs -nw hosts.amigo
```

- `REPLACE_ME`
  - Should be IP address of new EC2 instance from above

## Setup cert retreival

Next, setup automatic cert retreival.

If production (geneontology.org):

```bash
ansible-playbook wildcard-setup.yaml --inventory=hosts.amigo --private-key=/tmp/go-ssh -e target_domain=geneontology.org -e target_host=amigo-in-aws -e target_user=ubuntu
```

If development (geneontology.io):

```bash
ansible-playbook wildcard-setup.yaml --inventory=hosts.amigo --private-key=/tmp/go-ssh -e target_domain=geneontology.io -e target_host=amigo-in-aws -e target_user=ubuntu
```

## Setup and start AmiGO/GOlr in AWS instance

Next, ready the amigo and golr setup.

```bash
emacs -nw amigo-golr-setup.yml
```

If development/geneontology.io:

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
ansible-playbook amigo-golr-setup.yml --inventory=hosts.amigo --private-key="/tmp/go-ssh" -e target_host=amigo-in-aws -e target_user=ubuntu
```

## Load GOlr w/data

Outside of docker image, we'll use our "traditional" tools to load
this AmiGO image.

```bash
git clone https://github.com/geneontology/operations.git
```

In geneontology/operations/ansible, add target (amigo-noctua-dev) with
the IP above into (new) hosts.neo:

```bash
emacs -nw hosts.neo
```

then, changing `PATH` as needed for your local environment:

```bash
ansible-playbook update-golr-w-skyhook-forced.yaml --inventory=hosts.neo --private-key=/PATH/go-ssh -e target_branch=issue-35-neo-test -e target_host=amigo-noctua-dev -e target_user=ubuntu
```

## Destroy instance and delete workspace

Make sure you are deleting the correct workspace:

```bash
go-deploy --workspace amigo-development-YYYY-MM-DD --working-directory aws -verbose -show
```

Destroy:

```bash
go-deploy --workspace amigo-development-YYYY-MM-DD --working-directory aws -verbose -destroy
```
