# Welcome...

...to the experimental GASS service test server.

## Setup/run

At the top of the amigo repo, assuming you have a decently recent
version of node:

- npm install
- node ./scripts/gass.js -g http://golr.berkeleybop.org/solr/ -p 6455

Then point your browser to: http://localhost:6455

## API

### /gene-to-term

Given some gene IDs, find the number of terms associated with them by group, single counting a gene product / term relationship (i.e. all annotations count for "1").

#### Example

[/gene-to-term?q=UniProtKB:F1M4Q5&q=UniProtKB:F1M4Q5&q=UniProtKB:E1BYP4](/gene-to-term?q=UniProtKB:F1M4Q5&q=UniProtKB:F1M4Q5&q=UniProtKB:E1BYP4)

### /term-to-gene

Given some term IDs, find the number of the number of gene products
associated with each one.

#### Example

[/term-to-gene?q=GO:0022008&q=GO:0008150](/term-to-gene?q=GO:0022008&q=GO:0008150)

```
{"service":"term-to-gene","status":"success","q":["GO:0022008","GO:0008150"],"summary":{"term-to-gene-summary-count":{"GO:0022008":17158,"GO:0008150":851963}}}
```

### /overview

Get an overview of the total database counts.

#### Example

[/overview](overview)

```
{"service":"overview","status":"success","summary":{"term-count":168530,"gene-product-count":991219,"annotation-count":5798000}}
```
