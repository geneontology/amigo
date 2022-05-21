# Production Provisioning

#### Introduction

You are here because you are planning on deploying a new amigo server and destroying the old one if any.

- If you want to get familiar with terraform and deploy on AWS, refer to [this document](../PROVISION_AWS_README.md).
- If you want to test amigo locally refer to [this document](../PROVISION_README.md).

We use terraform workspaces and S3 backend to store terraform state. 

- https://www.terraform.io/language/state/workspaces
- https://www.terraform.io/language/settings/backends/s3

#### Preparation

You need the following before you begin:

- Terraform
  - Terraform version v1.1.4 or higher
  - The aws credentials to access AWS account stored in ~/.aws/credentials.
    - see aws/provider.tf and note the default aws profile
  - The name of the s3 bucket used to store terraform state and read/write access to it.
  - The ssh keys used for this stack

- Ansible
  -  The s3cfg credentials to access the s3 bucket used to store the server's access log

#### AWS CREDENTIALS/TERRAFORM BACKEND 

Note you would need to create some files and modify them as stated below.

- backend.tf     
  - Points to terraform backend

- s3cfg          
  - Needed by the server to populate the s3 bucket with apache logs. See production/s3cfg.sample

#### Deploy The New Stack

```sh
cd provision

# This file is used to configure the Terraform S3 Backend.
cp production/backend.tf.sample aws/backend.tf # Now modify it with the name of the s3 bucket and the aws profile if it is not default

# Deploy
Use Python script to deploy.

>pip install go-deploy==0.1.0
>go-deploy -h

>cp ./production/config.yaml.sample config.yaml

# We append the date to the terraform workspace name. As as an example we will use production-yy-mm-dd

# Dry Run
>go-deploy -init -c config.yaml -w internal-yy-mm-dd -d aws -dry-run -verbose

# Deploy
>go-deploy -init -c config.yaml -w internal-yy-mm-dd -d aws -verbose

# What just happened?
terraform -chdir=aws output -raw public_ip     # shows elastic ip
terraform -chdir=aws output                    # shows all output 
terraform -chdir=aws show                      # shows what was deployed vpc, instance, ....

# On AWS Console,  you should see the new workspace listed under s3://bucket_name/env:/
```

#### Testing

Access amigo using the browser at http://{{ AMIGO_DYNAMIC }}/amigo

- For details refer to testing section [this document](../PROVISION_AWS_README.md).

#### Destroy The Old Stack 

- Note you would need the select the old workspace. 

```sh
terraform -chdir=aws workspace select production-mm-dd-yy
terraform -chdir=aws workspace show   # confirm this the workspace before calling destroy.
terraform -chdir=aws show             # confirm this is the state you intend to destroy.
terraform -chdir=aws output           # confirm this is the old ip address
terraform -chdir=aws destroy          # you will be prompted one last time before destroying, enter yes
terraform -chdir=aws show             # should show nothing
```
