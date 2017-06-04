# Welcome...

...to the experimental AmiGO JSON API server.

## Setup/run

At the top of the amigo repo, assuming you have a decently recent
version of node:

- npm install
- node ./bin/amigo.js -g http://golr.berkeleybop.org/solr/ -p 6455

Then point your browser to: http://localhost:6455

You can also use gulpfile.js to reuse your amigo.yaml like:

- gulp run-amigo-api

Or to override the target GOlr instance URL:

- GOLR_URL='http://golr.geneontology.org/' gulp run-amigo-api

There is also a developer restart server setup with:

- gulp develop-amigo-api

## API

The general JSON API return envelope looks like:

```json
{
    "service": "<SERVICE_NAME>",
    "status": "success|failure",
    "date": "<DATE_STRING>",
    "time": "<PROCESSING_TIME>",
    "arguments": null,
    "comments": [],
    "data": null
}
```

### /api/term/<TERM_ID>

Given a term ID, find all information.

#### Example

[/api/entity/term/GO:0022008](/api/entity/term/GO:0022008)

```
TOO LARGE
```

### /api/terms

Given a list of term IDs, find all information.

#### Example

[/api/entity/terms?entity=GO:0022008&entity=GO:0008150](/api/entity/terms?entity=GO:0022008&entity=GO:0008150)

```
TOO LARGE
```

### /api/entity/bioentity/<BIOENTITY_ID>

Given a bioentity ID, find all information.

#### Example

[/api/entity/bioentity/SGD:S000001666](/api/entity/bioentity/SGD:S000001666)

```
TOO LARGE
```

### /api/search/<PERSONALITY>

Given a search personality and some parameters, find items that match.

#### Example 1

[/api/search/ontology?q=neuro](/api/search/ontology?q=neuro)

```
TOO LARGE
```

#### Example 2

[/api/search/annotation?q=nucleus&fq=assigned\_by:%22MGI%22](/api/search/annotation?q=nucleus&fq=assigned\_by:%22MGI%22)

```
TOO LARGE
```

### /api/autocomplete/<PERSONALITY>

The same as /api/search/<PERSONALITY>, except with a lighter payload
(using manager.lite(true)).

#### Example

[/api/autocomplete/ontology?q=neuro](/api/autocomplete/ontology?q=neuro)

```
TOO LARGE
```

### /api/statistics/gene-to-term

Given some gene IDs, find the number of terms associated with them by
group, single counting a gene product / term relationship (i.e. all
annotations count for "1").

You can optionally a one or more "species" parameters to filter counts
by (transitive) species.

#### Example 1 (truncated)

[/api/statistics/gene-to-term?bioentity=UniProtKB:F1M4Q5&bioentity=UniProtKB:F1M4Q5&bioentity=UniProtKB:E1BYP4](/api/statistics/gene-to-term?bioentity=UniProtKB:F1M4Q5&bioentity=UniProtKB:F1M4Q5&bioentity=UniProtKB:E1BYP4)

```json
{
    "service": "/api/statistics/gene-to-term",
    "status": "success",
    "arguments": {
        "bioentity": [
            "UniProtKB:F1M4Q5",
            "UniProtKB:E1BYP4"
        ],
        "species": []
    },
    "comments": [],
    "data": {
        "gene-to-term-summary-count": {
            "GO:0008150": 2,
            "GO:0009987": 2,
            "GO:0003674": 2,
            "GO:0006464": 1,
            "GO:0006470": 1,
            "GO:0006793": 1,
            "GO:0006796": 1,
        }
    },
    "time": 0,
    "date": "2016-02-25T14:02:50"
}
```

#### Example 2 (with _impossible_ species filter)

[/api/statistics/gene-to-term?bioentity=UniProtKB:F1M4Q5&bioentity=UniProtKB:F1M4Q5&bioentity=UniProtKB:E1BYP4&species=NCBITaxon:9606](/api/statistics/gene-to-term?bioentity=UniProtKB:F1M4Q5&bioentity=UniProtKB:E1BYP4&species=NCBITaxon:9606)

```json
{
    "service": "/api/statistics/gene-to-term",
    "status": "success",
    "arguments": {
        "bioentity": [
            "UniProtKB:F1M4Q5",
            "UniProtKB:E1BYP4"
        ],
        "species": [
            "NCBITaxon:9606"
        ]
    },
    "comments": [],
    "data": {
        "gene-to-term-summary-count": null
    },
    "time": 0,
    "date": "2016-02-25T14:02:24"
}
```

### /api/statistics/term-to-gene

Given some term IDs, find the number of the number of gene products
associated with each one.

You can optionally a one or more "species" parameters to filter counts
by (transitive) species.

#### Example 1

[/api/statistics/term-to-gene?term=GO:0022008&term=GO:0008150](/api/statistics/term-to-gene?term=GO:0022008&term=GO:0008150)

```json
{
    "service": "/api/statistics/gene-to-term",
    "status": "success",
    "arguments": {
        "term": [
            "GO:0022008",
            "GO:0008150"
        ],
        "species": []
    },
    "comments": [],
    "data": {
        "term-to-gene-summary-count": {
            "GO:0022008": 14541,
            "GO:0008150": 812745
        }
    },
    "time": 0,
    "date": "2016-02-25T14:02:52"
}
```

#### Example 2 (with species filter)

[/api/statistics/term-to-gene?term=GO:0022008&term=GO:0008150&species=NCBITaxon:9606](/api/statistics/term-to-gene?term=GO:0022008&term=GO:0008150&species=NCBITaxon:9606)

```json
{
    "service": "/api/statistics/gene-to-term",
    "status": "success",
    "arguments": {
        "term": [
            "GO:0022008",
            "GO:0008150"
        ],
        "species": [
            "NCBITaxon:9606"
        ]
    },
    "comments": [],
    "data": {
        "term-to-gene-summary-count": {
            "GO:0022008": 1269,
            "GO:0008150": 34063
        }
    },
    "time": 0,
    "date": "2016-02-25T14:02:10"
}
```

### /api/overview

Get an overview of the total database counts.

You can optionally a one or more "species" parameters to filter gene
production and annotation counts by (transitive) species.

#### Example 1

[/api/statistics/overview](/api/statistics/overview)

```json
{
    "service": "/api/statistics/overview",
    "status": "success",
    "arguments": {
        "species": []
    },
    "comments": [],
    "data": {
        "term-count": 171943,
        "gene-product-count": 952303,
        "annotation-count": 6233301
    },
    "time": 0,
    "date": "2016-02-25T14:02:26"
}
```

#### Example 2 (with species filter)
 
[/api/statistics/overview?species=NCBITaxon:9606](/api/statistics/overview?species=NCBITaxon:9606)

```json
{
    "service": "/api/statistics/overview",
    "status": "success",
    "arguments": {
        "species": [
            "NCBITaxon:9606"
        ]
    },
    "comments": [],
    "data": {
        "term-count": 171943,
        "gene-product-count": 48753,
        "annotation-count": 503780
    },
    "time": 0,
    "date": "2016-02-25T14:02:43"
}
```

### /api/disambiguation/bioentity

Try and resolve the identifiers of one or more string entities in a
"bioentity" document.

In addition to one or more "entity" parameters, you need to have a
single "species" parameter.

#### Example 1

Failure to have any entities to disambiguate.

[/api/disambiguation/bioentity?species=NCBITaxon:3037](/api/disambiguation/bioentity?species=NCBITaxon:3037)

```json
{
  "date": "2016-11-14T19:11:28",
  "time": 0,
  "data": null,
  "comments": [
    "Death by lack of entities."
  ],
  "arguments": {
    "species": [
      "NCBITaxon:3037"
    ],
    "entity": []
  },
  "status": "failure",
  "service": "/api/disambiguation/bioentity"
}
```

#### Example 2

Empty return on an unknown species.

[/api/disambiguation/bioentity?species=NCBITaxon:99999&entity=pacA&entity=UniProtKB:Q76L33](/api/disambiguation/bioentity?species=NCBITaxon:99999&entity=pacA&entity=UniProtKB:Q76L33)

```json
{
  "date": "2016-11-15T13:11:18",
  "time": 0,
  "data": {
    "ugly": [],
    "bad": [
      {
        "results": [],
        "input": "pacA"
      },
      {
        "results": [],
        "input": "UniProtKB:Q76L33"
      }
    ],
    "good": []
  },
  "comments": [],
  "arguments": {
    "species": [
      "NCBITaxon:99999"
    ],
    "entity": [
      "pacA",
      "UniProtKB:Q76L33"
    ]
  },
  "status": "success",
  "service": "/api/disambiguation/bioentity"
}
```

#### Example 3

Resolve a synbol and an id for "Euglena longa".

[/api/disambiguation/bioentity?species=NCBITaxon:3037&entity=pacA&entity=UniProtKB:Q76L33](/api/disambiguation/bioentity?species=NCBITaxon:3037&entity=pacA&entity=UniProtKB:Q76L33)

```json
{
  "date": "2016-11-15T13:11:07",
  "time": 0,
  "data": {
    "ugly": [],
    "bad": [],
    "good": [
      {
        "results": [
          {
            "matched": "bioentity_label",
            "id": "UniProtKB:Q76L34"
          }
        ],
        "input": "pacA"
      },
      {
        "results": [
          {
            "matched": "bioentity",
            "id": "UniProtKB:Q76L33"
          }
        ],
        "input": "UniProtKB:Q76L33"
      }
    ]
  },
  "comments": [],
  "arguments": {
    "species": [
      "NCBITaxon:3037"
    ],
    "entity": [
      "pacA",
      "UniProtKB:Q76L33"
    ]
  },
  "status": "success",
  "service": "/api/disambiguation/bioentity"
}
```
