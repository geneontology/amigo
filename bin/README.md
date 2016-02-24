# Welcome...

...to the experimental AmiGO 3.x server.

## Setup/run

At the top of the amigo repo, assuming you have a decently recent
version of node:

- npm install
- node ./bin/amigo.js -g http://golr.berkeleybop.org/solr/ -p 6455

Then point your browser to: http://localhost:6455

## API

### /api/gene-to-term

Given some gene IDs, find the number of terms associated with them by group, single counting a gene product / term relationship (i.e. all annotations count for "1").

You can optionally a one or more "s" parameters to filter counts by
(transitive) species.

#### Example 1

[/api/gene-to-term?q=UniProtKB:F1M4Q5&q=UniProtKB:F1M4Q5&q=UniProtKB:E1BYP4](/api/gene-to-term?q=UniProtKB:F1M4Q5&q=UniProtKB:F1M4Q5&q=UniProtKB:E1BYP4)

```
{"service":"gene-to-term","status":"success","q":["UniProtKB:F1M4Q5","UniProtKB:E1BYP4"],"s":[],"summary":{"gene-to-term-summary-count":{"GO:0008150":2,"GO:0009987":2,"GO:0003674":2,"GO:0006464":1,"GO:0006470":1,"GO:0006793":1,"GO:0006796":1,"GO:0008152":2,"GO:0016311":1,"GO:0019538":1,"GO:0036211":1,"GO:0043170":1,"GO:0043412":1,"GO:0044237":2,"GO:0044238":2,"GO:0044260":1,"GO:0044267":1,"GO:0071704":2,"GO:0016043":2,"GO:0044699":2,"GO:0044763":2,"GO:0050789":1,"GO:0050794":1,"GO:0051128":1,"GO:0065007":1,"GO:0071840":2,"GO:0003824":1,"GO:0004721":1,"GO:0005488":2,"GO:0016787":1,"GO:0016788":1,"GO:0016791":1,"GO:0030030":1,"GO:0031344":1,"GO:0035335":1,"GO:0042578":1,"GO:0000902":1,"GO:0000904":1,"GO:0003676":1,"GO:0003677":1,"GO:0003779":1,"GO:0004725":1,"GO:0005515":2,"GO:0005575":2,"GO:0005622":2,"GO:0005623":2,"GO:0005737":2,"GO:0006996":2,"GO:0007010":1,"GO:0007015":1,"GO:0007275":2,"GO:0007399":2,"GO:0008064":1,"GO:0008092":1,"GO:0008138":1,"GO:0008154":1,"GO:0009653":2,"GO:0010591":1,"GO:0010769":1,"GO:0010975":1,"GO:0022008":2,"GO:0022603":1,"GO:0022604":1,"GO:0022607":1,"GO:0030029":1,"GO:0030031":1,"GO:0030032":1,"GO:0030036":1,"GO:0030154":2,"GO:0030182":1,"GO:0030832":1,"GO:0031175":1,"GO:0032501":2,"GO:0032502":2,"GO:0032535":1,"GO:0032956":1,"GO:0032970":1,"GO:0032989":1,"GO:0032990":1,"GO:0033043":1,"GO:0043933":1,"GO:0044085":1,"GO:0044087":1,"GO:0044424":2,"GO:0044464":2,"GO:0044707":2,"GO:0044767":2,"GO:0045595":1,"GO:0045664":1,"GO:0048468":1,"GO:0048666":1,"GO:0048667":1,"GO:0048699":2,"GO:0048731":2,"GO:0048812":1,"GO:0048856":2,"GO:0048858":1,"GO:0048869":2,"GO:0050767":1,"GO:0050770":1,"GO:0050793":1,"GO:0051239":1,"GO:0051493":1,"GO:0051960":1,"GO:0060284":1,"GO:0060491":1,"GO:0061564":1,"GO:0065008":1,"GO:0071822":1,"GO:0090066":1,"GO:0097159":1,"GO:0097581":1,"GO:1901363":1,"GO:1902589":2,"GO:1902743":1,"GO:2000026":1,"OBA:0000001":1,"OBA:0000011":1,"OBA:0000015":1,"OBA:0000057":1,"GO:0006629":1,"GO:0044255":1,"GO:0044281":1,"GO:0044444":1,"GO:0044710":1,"GO:0051179":1,"GO:0000268":1,"GO:0001501":1,"GO:0001503":1,"GO:0001764":1,"GO:0001958":1,"GO:0005048":1,"GO:0005053":1,"GO:0005777":1,"GO:0005782":1,"GO:0005829":1,"GO:0006082":1,"GO:0006605":1,"GO:0006625":1,"GO:0006631":1,"GO:0006635":1,"GO:0006662":1,"GO:0006810":1,"GO:0006886":1,"GO:0006928":1,"GO:0007031":1,"GO:0008104":1,"GO:0008610":1,"GO:0008611":1,"GO:0009056":1,"GO:0009058":1,"GO:0009062":1,"GO:0009887":1,"GO:0015031":1,"GO:0016042":1,"GO:0016054":1,"GO:0016477":1,"GO:0016482":1,"GO:0016558":1,"GO:0017038":1,"GO:0018904":1,"GO:0019395":1,"GO:0019752":1,"GO:0019899":1,"GO:0030258":1,"GO:0031907":1,"GO:0031974":1,"GO:0032787":1,"GO:0033036":1,"GO:0033218":1,"GO:0033365":1,"GO:0034440":1,"GO:0034613":1,"GO:0036075":1,"GO:0040011":1,"GO:0042277":1,"GO:0042579":1,"GO:0042802":1,"GO:0042803":1,"GO:0043226":1,"GO:0043227":1,"GO:0043229":1,"GO:0043231":1,"GO:0043233":1,"GO:0043436":1,"GO:0043574":1,"GO:0044242":1,"GO:0044248":1,"GO:0044249":1,"GO:0044282":1,"GO:0044422":1,"GO:0044438":1,"GO:0044439":1,"GO:0044446":1,"GO:0044711":1,"GO:0044712":1,"GO:0044743":1,"GO:0044765":1,"GO:0045184":1,"GO:0046395":1,"GO:0046485":1,"GO:0046504":1,"GO:0046907":1,"GO:0046983":1,"GO:0048513":1,"GO:0048705":1,"GO:0048870":1,"GO:0051234":1,"GO:0051641":1,"GO:0051649":1,"GO:0051674":1,"GO:0055085":1,"GO:0055114":1,"GO:0060348":1,"GO:0060349":1,"GO:0060350":1,"GO:0065002":1,"GO:0070013":1,"GO:0070727":1,"GO:0071702":1,"GO:0071806":1,"GO:0072329":1,"GO:0072594":1,"GO:0072662":1,"GO:0072663":1,"GO:0097384":1,"GO:1901503":1,"GO:1901575":1,"GO:1901576":1,"GO:1902578":1,"GO:1902580":1,"GO:1902582":1}}}
```

#### Example 2 (with species filter)

[/api/gene-to-term?q=UniProtKB:F1M4Q5&q=UniProtKB:F1M4Q5&q=UniProtKB:E1BYP4&s=NCBITaxon:9606](/api/gene-to-term?q=UniProtKB:F1M4Q5&q=UniProtKB:F1M4Q5&q=UniProtKB:E1BYP4&s=NCBITaxon:9606)

```
{"service":"gene-to-term","status":"success","q":["UniProtKB:F1M4Q5","UniProtKB:E1BYP4"],"s":["NCBITaxon:9606"],"summary":{"gene-to-term-summary-count":{}}}
```

### /api/term-to-gene

Given some term IDs, find the number of the number of gene products
associated with each one.

You can optionally a one or more "s" parameters to filter counts by
(transitive) species.

#### Example 1

[/api/term-to-gene?q=GO:0022008&q=GO:0008150](/api/term-to-gene?q=GO:0022008&q=GO:0008150)

```
{"service":"term-to-gene","status":"success","q":["GO:0022008","GO:0008150"],"s":[],"summary":{"term-to-gene-summary-count":{"GO:0022008":17158,"GO:0008150":851963}}}
```

#### Example 2 (with species filter)

[/api/term-to-gene?q=GO:0022008&q=GO:0008150&s=NCBITaxon:9606](/api/term-to-gene?q=GO:0022008&q=GO:0008150&s=NCBITaxon:9606)

```
{"service":"term-to-gene","status":"success","q":["GO:0022008","GO:0008150"],"s":["NCBITaxon:9606"],"summary":{"term-to-gene-summary-count":{"GO:0022008":1477,"GO:0008150":37108}}}
```

### /api/overview

Get an overview of the total database counts.

You can optionally a one or more "s" parameters to filter gene
production and annotation counts by (transitive) species.

#### Example 1

[/api/overview](/api/overview)

```
{"service":"overview","status":"success","s":[],"summary":{"term-count":168530,"gene-product-count":991219,"annotation-count":5798000}}
```

#### Example 2 (with species filter)
 
[/api/overview?s=NCBITaxon:9606](/api/overview?s=NCBITaxon:9606)

```
{"service":"overview","status":"success","s":["NCBITaxon:9606"],"summary":{"term-count":168530,"gene-product-count":50690,"annotation-count":513459}}
```
