# Deployment

## Manual

This is the way that a lot of development is done. For an overview of
how to setup, see the main
[README.md](http://github.com/geneontology/amigo/) in the project
repo.

## Ansible

This is aimed at getting AWS instances of a complete Noctua stack up
and running with as little pain as possible.

We are going to assume that you have a fairly standard AWS instance,
with decent memory, keyed to "noctua-demo-deployment.pem", at
address 127.0.0.1.

```
ansible-playbook -l 127.0.0.1 --private-key golr-deployment.pem ./golr-bulk-up.playbook.yaml
```

## Ansible/Docker
