/* 
 * Package: golr.js
 * 
 * Namespace: amigo.data.golr
 * 
 * This package was automatically created during an AmiGO 2 installation
 * from the YAML configuration files that AmiGO pulls in.
 *
 * Useful information about GOlr. See the package <golr_conf.js>
 * for the API to interact with this data file.
 *
 * NOTE: This file is generated dynamically at installation time.
 * Hard to work with unit tests--hope it's not too bad. You have to
 * occasionally copy back to keep the unit tests sane.
 *
 * NOTE: This file has a slightly different latout from the YAML
 * configurations files--in addition instead of the fields
 * being in lists (fields), they are in hashes keyed by the
 * field id (fields_hash).
 */

// All of the server/instance-specific meta-data.
if ( typeof amigo == "undefined" ){ var amigo = {}; }
if ( typeof amigo.data == "undefined" ){ amigo.data = {}; }

/*
 * Variable: golr
 * 
 * The configuration for the data.
 * Essentially a JSONification of the OWLTools YAML files.
 * This should be consumed directly by <bbop.golr.conf>.
 */
amigo.data.golr = {
   "ontology" : {
      "searchable_extension" : "_searchable",
      "result_weights" : "annotation_class^8.0 description^6.0 source^4.0 idspace^3.5 synonym^3.0 alternate_id^2.0",
      "fields_hash" : {
         "annotation_relation" : {
            "searchable" : "false",
            "type" : "string",
            "id" : "annotation_relation",
            "display_name" : "Annotation relation",
            "required" : "false",
            "transform" : [],
            "cardinality" : "single",
            "description" : "This is equivalent to the relation field in GPAD.",
            "indexed" : "true",
            "property" : [
               "getDummyString"
            ]
         },
         "is_obsolete" : {
            "cardinality" : "single",
            "description" : "Is the term obsolete?",
            "required" : "false",
            "transform" : [],
            "indexed" : "true",
            "property" : [
               "getIsObsoleteBinaryString"
            ],
            "searchable" : "false",
            "type" : "boolean",
            "display_name" : "Obsoletion",
            "id" : "is_obsolete"
         },
         "annotation_extension_owl_json" : {
            "type" : "string",
            "searchable" : "false",
            "id" : "annotation_extension_owl_json",
            "display_name" : "Annotation extension",
            "indexed" : "true",
            "transform" : [],
            "required" : "false",
            "description" : "A non-lossy representation of conjunctions and disjunctions in c16 (JSON).",
            "cardinality" : "single",
            "property" : [
               "getDummyString"
            ]
         },
         "description" : {
            "type" : "string",
            "searchable" : "true",
            "display_name" : "Definition",
            "id" : "description",
            "indexed" : "true",
            "description" : "Term definition.",
            "cardinality" : "single",
            "transform" : [],
            "required" : "false",
            "property" : [
               "getDef"
            ]
         },
         "definition_xref" : {
            "property" : [
               "getDefXref"
            ],
            "required" : "false",
            "transform" : [],
            "description" : "Definition cross-reference.",
            "cardinality" : "multi",
            "indexed" : "true",
            "id" : "definition_xref",
            "display_name" : "Def xref",
            "searchable" : "false",
            "type" : "string"
         },
         "isa_partof_closure_label" : {
            "id" : "isa_partof_closure_label",
            "display_name" : "Is-a/part-of",
            "searchable" : "true",
            "type" : "string",
            "property" : [
               "getRelationLabelClosure",
               "BFO:0000050"
            ],
            "transform" : [],
            "required" : "false",
            "cardinality" : "multi",
            "description" : "Ancestral terms (is_a/part_of).",
            "indexed" : "true"
         },
         "only_in_taxon_closure_label" : {
            "property" : [
               "getDummyStrings"
            ],
            "description" : "Only in taxon label closure.",
            "cardinality" : "multi",
            "required" : "false",
            "transform" : [],
            "indexed" : "true",
            "display_name" : "Only in taxon",
            "id" : "only_in_taxon_closure_label",
            "searchable" : "true",
            "type" : "string"
         },
         "annotation_relation_label" : {
            "id" : "annotation_relation_label",
            "display_name" : "Annotation relation",
            "searchable" : "true",
            "type" : "string",
            "property" : [
               "getDummyString"
            ],
            "required" : "false",
            "transform" : [],
            "description" : "This is equivalent to the relation field in GPAD.",
            "cardinality" : "single",
            "indexed" : "true"
         },
         "alternate_id" : {
            "property" : [
               "getAnnotationPropertyValues",
               "alt_id"
            ],
            "indexed" : "true",
            "required" : "false",
            "transform" : [],
            "cardinality" : "multi",
            "description" : "Alternate term identifier.",
            "id" : "alternate_id",
            "display_name" : "Alt ID",
            "type" : "string",
            "searchable" : "false"
         },
         "regulates_closure_label" : {
            "property" : [
               "getRelationLabelClosure",
               "BFO:0000050",
               "BFO:0000066",
               "RO:0002211",
               "RO:0002212",
               "RO:0002213",
               "RO:0002215",
               "RO:0002216"
            ],
            "description" : "Ancestral terms (regulates, occurs in, capable_of).",
            "cardinality" : "multi",
            "transform" : [],
            "required" : "false",
            "indexed" : "true",
            "display_name" : "Ancestor",
            "id" : "regulates_closure_label",
            "searchable" : "true",
            "type" : "string"
         },
         "annotation_class" : {
            "id" : "annotation_class",
            "display_name" : "Term",
            "searchable" : "false",
            "type" : "string",
            "property" : [
               "getIdentifier"
            ],
            "required" : "false",
            "transform" : [],
            "cardinality" : "single",
            "description" : "Term identifier.",
            "indexed" : "true"
         },
         "disjoint_class_list_label" : {
            "property" : [
               "getDummyStrings"
            ],
            "required" : "false",
            "transform" : [],
            "description" : "Disjoint classes.",
            "cardinality" : "multi",
            "indexed" : "true",
            "id" : "disjoint_class_list_label",
            "display_name" : "Disjoint classes",
            "searchable" : "true",
            "type" : "string"
         },
         "source" : {
            "property" : [
               "getNamespace"
            ],
            "transform" : [],
            "required" : "false",
            "description" : "Term namespace.",
            "cardinality" : "single",
            "indexed" : "true",
            "id" : "source",
            "display_name" : "Ontology source",
            "searchable" : "false",
            "type" : "string"
         },
         "regulates_transitivity_graph_json" : {
            "id" : "regulates_transitivity_graph_json",
            "display_name" : "Regulates transitivity graph (JSON)",
            "type" : "string",
            "searchable" : "false",
            "property" : [
               "getLineageShuntGraphJSON",
               "BFO:0000050",
               "BFO:0000066",
               "RO:0002211",
               "RO:0002212",
               "RO:0002213",
               "RO:0002215",
               "RO:0002216"
            ],
            "indexed" : "false",
            "required" : "false",
            "transform" : [],
            "cardinality" : "single",
            "description" : "JSON blob form of the local relation transitivity graph. Uses various relations (including regulates, occurs in, capable_of)."
         },
         "subset" : {
            "display_name" : "Subset",
            "id" : "subset",
            "searchable" : "false",
            "type" : "string",
            "property" : [
               "getSubsets"
            ],
            "description" : "Special use collections of terms.",
            "cardinality" : "multi",
            "required" : "false",
            "transform" : [],
            "indexed" : "true"
         },
         "equivalent_class_expressions_json" : {
            "indexed" : "true",
            "required" : "false",
            "transform" : [],
            "cardinality" : "single",
            "description" : "For any class document C, this will contain json(CE) for all axioms of form EquivalentClasses(C ... CE ....).",
            "property" : [
               "getDummyString"
            ],
            "type" : "string",
            "searchable" : "false",
            "id" : "equivalent_class_expressions_json",
            "display_name" : "Eq class expressions"
         },
         "regulates_closure" : {
            "property" : [
               "getRelationIDClosure",
               "BFO:0000050",
               "BFO:0000066",
               "RO:0002211",
               "RO:0002212",
               "RO:0002213",
               "RO:0002215",
               "RO:0002216"
            ],
            "transform" : [],
            "required" : "false",
            "description" : "Ancestral terms (regulates, occurs in, capable_of).",
            "cardinality" : "multi",
            "indexed" : "true",
            "id" : "regulates_closure",
            "display_name" : "Ancestor",
            "searchable" : "false",
            "type" : "string"
         },
         "topology_graph_json" : {
            "property" : [
               "getSegmentShuntGraphJSON",
               "BFO:0000050",
               "BFO:0000066",
               "RO:0002211",
               "RO:0002212",
               "RO:0002213",
               "RO:0002215",
               "RO:0002216"
            ],
            "indexed" : "false",
            "transform" : [],
            "required" : "false",
            "cardinality" : "single",
            "description" : "JSON blob form of the local stepwise topology graph. Uses various relations (including regulates, occurs in, capable_of).",
            "id" : "topology_graph_json",
            "display_name" : "Topology graph (JSON)",
            "type" : "string",
            "searchable" : "false"
         },
         "only_in_taxon_label" : {
            "transform" : [],
            "required" : "false",
            "description" : "Only in taxon label.",
            "cardinality" : "single",
            "indexed" : "true",
            "property" : [
               "getDummyString"
            ],
            "searchable" : "true",
            "type" : "string",
            "id" : "only_in_taxon_label",
            "display_name" : "Only in taxon"
         },
         "disjoint_class_list" : {
            "searchable" : "false",
            "type" : "string",
            "display_name" : "Disjoint classes",
            "id" : "disjoint_class_list",
            "cardinality" : "multi",
            "description" : "Disjoint classes.",
            "required" : "false",
            "transform" : [],
            "indexed" : "true",
            "property" : [
               "getDummyStrings"
            ]
         },
         "replaced_by" : {
            "type" : "string",
            "searchable" : "false",
            "display_name" : "Replaced By",
            "id" : "replaced_by",
            "indexed" : "true",
            "description" : "Term that replaces this term.",
            "cardinality" : "multi",
            "required" : "false",
            "transform" : [],
            "property" : [
               "getAnnotationPropertyValues",
               "replaced_by"
            ]
         },
         "only_in_taxon_closure" : {
            "type" : "string",
            "searchable" : "false",
            "display_name" : "Only in taxon (IDs)",
            "id" : "only_in_taxon_closure",
            "indexed" : "true",
            "cardinality" : "multi",
            "description" : "Only in taxon closure.",
            "required" : "false",
            "transform" : [],
            "property" : [
               "getDummyStrings"
            ]
         },
         "consider" : {
            "property" : [
               "getAnnotationPropertyValues",
               "consider"
            ],
            "required" : "false",
            "transform" : [],
            "description" : "Others terms you might want to look at.",
            "cardinality" : "multi",
            "indexed" : "true",
            "id" : "consider",
            "display_name" : "Consider",
            "searchable" : "false",
            "type" : "string"
         },
         "comment" : {
            "id" : "comment",
            "display_name" : "Comments",
            "searchable" : "true",
            "type" : "string",
            "property" : [
               "getComments"
            ],
            "required" : "false",
            "transform" : [],
            "description" : "Term comments.",
            "cardinality" : "multi",
            "indexed" : "true"
         },
         "only_in_taxon" : {
            "id" : "only_in_taxon",
            "display_name" : "Only in taxon",
            "type" : "string",
            "searchable" : "true",
            "property" : [
               "getDummyString"
            ],
            "indexed" : "true",
            "transform" : [],
            "required" : "false",
            "cardinality" : "single",
            "description" : "Only in taxon."
         },
         "idspace" : {
            "display_name" : "Ontology ID space",
            "id" : "idspace",
            "searchable" : "false",
            "type" : "string",
            "property" : [
               "getIdSpace"
            ],
            "cardinality" : "single",
            "description" : "Term ID space.",
            "transform" : [],
            "required" : "false",
            "indexed" : "true"
         },
         "annotation_class_label" : {
            "indexed" : "true",
            "description" : "Identifier.",
            "cardinality" : "single",
            "transform" : [],
            "required" : "false",
            "property" : [
               "getLabel"
            ],
            "type" : "string",
            "searchable" : "true",
            "display_name" : "Term",
            "id" : "annotation_class_label"
         },
         "isa_partof_closure" : {
            "property" : [
               "getRelationIDClosure",
               "BFO:0000050"
            ],
            "indexed" : "true",
            "transform" : [],
            "required" : "false",
            "description" : "Ancestral terms (is_a/part_of).",
            "cardinality" : "multi",
            "id" : "isa_partof_closure",
            "display_name" : "Is-a/part-of",
            "type" : "string",
            "searchable" : "false"
         },
         "synonym" : {
            "property" : [
               "getOBOSynonymStrings"
            ],
            "cardinality" : "multi",
            "description" : "Term synonyms.",
            "transform" : [],
            "required" : "false",
            "indexed" : "true",
            "display_name" : "Synonyms",
            "id" : "synonym",
            "searchable" : "true",
            "type" : "string"
         },
         "id" : {
            "property" : [
               "getIdentifier"
            ],
            "description" : "Term identifier.",
            "cardinality" : "single",
            "transform" : [],
            "required" : "false",
            "indexed" : "true",
            "display_name" : "Acc",
            "id" : "id",
            "searchable" : "false",
            "type" : "string"
         },
         "database_xref" : {
            "property" : [
               "getXref"
            ],
            "indexed" : "true",
            "required" : "false",
            "transform" : [],
            "description" : "Database cross-reference.",
            "cardinality" : "multi",
            "id" : "database_xref",
            "display_name" : "DB xref",
            "type" : "string",
            "searchable" : "false"
         }
      },
      "description" : "Gene Ontology Term, Synonym, or Definition.",
      "filter_weights" : "source^4.0 idspace^3.5 subset^3.0 is_obsolete^0.0",
      "weight" : "40",
      "display_name" : "Ontology",
      "_infile" : "/home/sjcarbon//local/src/git/amigo/metadata/ont-config.yaml",
      "schema_generating" : "true",
      "id" : "ontology",
      "boost_weights" : "annotation_class^3.0 annotation_class_label^5.5 description^1.0 comment^0.5 synonym^1.0 alternate_id^1.0 regulates_closure^1.0 regulates_closure_label^1.0",
      "document_category" : "ontology_class",
      "_outfile" : "/home/sjcarbon//local/src/git/amigo/metadata/ont-config.yaml",
      "fields" : [
         {
            "property" : [
               "getIdentifier"
            ],
            "description" : "Term identifier.",
            "cardinality" : "single",
            "transform" : [],
            "required" : "false",
            "indexed" : "true",
            "display_name" : "Acc",
            "id" : "id",
            "searchable" : "false",
            "type" : "string"
         },
         {
            "id" : "annotation_class",
            "display_name" : "Term",
            "searchable" : "false",
            "type" : "string",
            "property" : [
               "getIdentifier"
            ],
            "required" : "false",
            "transform" : [],
            "cardinality" : "single",
            "description" : "Term identifier.",
            "indexed" : "true"
         },
         {
            "indexed" : "true",
            "description" : "Identifier.",
            "cardinality" : "single",
            "transform" : [],
            "required" : "false",
            "property" : [
               "getLabel"
            ],
            "type" : "string",
            "searchable" : "true",
            "display_name" : "Term",
            "id" : "annotation_class_label"
         },
         {
            "type" : "string",
            "searchable" : "true",
            "display_name" : "Definition",
            "id" : "description",
            "indexed" : "true",
            "description" : "Term definition.",
            "cardinality" : "single",
            "transform" : [],
            "required" : "false",
            "property" : [
               "getDef"
            ]
         },
         {
            "property" : [
               "getNamespace"
            ],
            "transform" : [],
            "required" : "false",
            "description" : "Term namespace.",
            "cardinality" : "single",
            "indexed" : "true",
            "id" : "source",
            "display_name" : "Ontology source",
            "searchable" : "false",
            "type" : "string"
         },
         {
            "display_name" : "Ontology ID space",
            "id" : "idspace",
            "searchable" : "false",
            "type" : "string",
            "property" : [
               "getIdSpace"
            ],
            "cardinality" : "single",
            "description" : "Term ID space.",
            "transform" : [],
            "required" : "false",
            "indexed" : "true"
         },
         {
            "cardinality" : "single",
            "description" : "Is the term obsolete?",
            "required" : "false",
            "transform" : [],
            "indexed" : "true",
            "property" : [
               "getIsObsoleteBinaryString"
            ],
            "searchable" : "false",
            "type" : "boolean",
            "display_name" : "Obsoletion",
            "id" : "is_obsolete"
         },
         {
            "id" : "comment",
            "display_name" : "Comments",
            "searchable" : "true",
            "type" : "string",
            "property" : [
               "getComments"
            ],
            "required" : "false",
            "transform" : [],
            "description" : "Term comments.",
            "cardinality" : "multi",
            "indexed" : "true"
         },
         {
            "property" : [
               "getOBOSynonymStrings"
            ],
            "cardinality" : "multi",
            "description" : "Term synonyms.",
            "transform" : [],
            "required" : "false",
            "indexed" : "true",
            "display_name" : "Synonyms",
            "id" : "synonym",
            "searchable" : "true",
            "type" : "string"
         },
         {
            "property" : [
               "getAnnotationPropertyValues",
               "alt_id"
            ],
            "indexed" : "true",
            "required" : "false",
            "transform" : [],
            "cardinality" : "multi",
            "description" : "Alternate term identifier.",
            "id" : "alternate_id",
            "display_name" : "Alt ID",
            "type" : "string",
            "searchable" : "false"
         },
         {
            "type" : "string",
            "searchable" : "false",
            "display_name" : "Replaced By",
            "id" : "replaced_by",
            "indexed" : "true",
            "description" : "Term that replaces this term.",
            "cardinality" : "multi",
            "required" : "false",
            "transform" : [],
            "property" : [
               "getAnnotationPropertyValues",
               "replaced_by"
            ]
         },
         {
            "property" : [
               "getAnnotationPropertyValues",
               "consider"
            ],
            "required" : "false",
            "transform" : [],
            "description" : "Others terms you might want to look at.",
            "cardinality" : "multi",
            "indexed" : "true",
            "id" : "consider",
            "display_name" : "Consider",
            "searchable" : "false",
            "type" : "string"
         },
         {
            "display_name" : "Subset",
            "id" : "subset",
            "searchable" : "false",
            "type" : "string",
            "property" : [
               "getSubsets"
            ],
            "description" : "Special use collections of terms.",
            "cardinality" : "multi",
            "required" : "false",
            "transform" : [],
            "indexed" : "true"
         },
         {
            "property" : [
               "getDefXref"
            ],
            "required" : "false",
            "transform" : [],
            "description" : "Definition cross-reference.",
            "cardinality" : "multi",
            "indexed" : "true",
            "id" : "definition_xref",
            "display_name" : "Def xref",
            "searchable" : "false",
            "type" : "string"
         },
         {
            "property" : [
               "getXref"
            ],
            "indexed" : "true",
            "required" : "false",
            "transform" : [],
            "description" : "Database cross-reference.",
            "cardinality" : "multi",
            "id" : "database_xref",
            "display_name" : "DB xref",
            "type" : "string",
            "searchable" : "false"
         },
         {
            "property" : [
               "getRelationIDClosure",
               "BFO:0000050"
            ],
            "indexed" : "true",
            "transform" : [],
            "required" : "false",
            "description" : "Ancestral terms (is_a/part_of).",
            "cardinality" : "multi",
            "id" : "isa_partof_closure",
            "display_name" : "Is-a/part-of",
            "type" : "string",
            "searchable" : "false"
         },
         {
            "id" : "isa_partof_closure_label",
            "display_name" : "Is-a/part-of",
            "searchable" : "true",
            "type" : "string",
            "property" : [
               "getRelationLabelClosure",
               "BFO:0000050"
            ],
            "transform" : [],
            "required" : "false",
            "cardinality" : "multi",
            "description" : "Ancestral terms (is_a/part_of).",
            "indexed" : "true"
         },
         {
            "property" : [
               "getRelationIDClosure",
               "BFO:0000050",
               "BFO:0000066",
               "RO:0002211",
               "RO:0002212",
               "RO:0002213",
               "RO:0002215",
               "RO:0002216"
            ],
            "transform" : [],
            "required" : "false",
            "description" : "Ancestral terms (regulates, occurs in, capable_of).",
            "cardinality" : "multi",
            "indexed" : "true",
            "id" : "regulates_closure",
            "display_name" : "Ancestor",
            "searchable" : "false",
            "type" : "string"
         },
         {
            "property" : [
               "getRelationLabelClosure",
               "BFO:0000050",
               "BFO:0000066",
               "RO:0002211",
               "RO:0002212",
               "RO:0002213",
               "RO:0002215",
               "RO:0002216"
            ],
            "description" : "Ancestral terms (regulates, occurs in, capable_of).",
            "cardinality" : "multi",
            "transform" : [],
            "required" : "false",
            "indexed" : "true",
            "display_name" : "Ancestor",
            "id" : "regulates_closure_label",
            "searchable" : "true",
            "type" : "string"
         },
         {
            "property" : [
               "getSegmentShuntGraphJSON",
               "BFO:0000050",
               "BFO:0000066",
               "RO:0002211",
               "RO:0002212",
               "RO:0002213",
               "RO:0002215",
               "RO:0002216"
            ],
            "indexed" : "false",
            "transform" : [],
            "required" : "false",
            "cardinality" : "single",
            "description" : "JSON blob form of the local stepwise topology graph. Uses various relations (including regulates, occurs in, capable_of).",
            "id" : "topology_graph_json",
            "display_name" : "Topology graph (JSON)",
            "type" : "string",
            "searchable" : "false"
         },
         {
            "id" : "regulates_transitivity_graph_json",
            "display_name" : "Regulates transitivity graph (JSON)",
            "type" : "string",
            "searchable" : "false",
            "property" : [
               "getLineageShuntGraphJSON",
               "BFO:0000050",
               "BFO:0000066",
               "RO:0002211",
               "RO:0002212",
               "RO:0002213",
               "RO:0002215",
               "RO:0002216"
            ],
            "indexed" : "false",
            "required" : "false",
            "transform" : [],
            "cardinality" : "single",
            "description" : "JSON blob form of the local relation transitivity graph. Uses various relations (including regulates, occurs in, capable_of)."
         },
         {
            "id" : "only_in_taxon",
            "display_name" : "Only in taxon",
            "type" : "string",
            "searchable" : "true",
            "property" : [
               "getDummyString"
            ],
            "indexed" : "true",
            "transform" : [],
            "required" : "false",
            "cardinality" : "single",
            "description" : "Only in taxon."
         },
         {
            "transform" : [],
            "required" : "false",
            "description" : "Only in taxon label.",
            "cardinality" : "single",
            "indexed" : "true",
            "property" : [
               "getDummyString"
            ],
            "searchable" : "true",
            "type" : "string",
            "id" : "only_in_taxon_label",
            "display_name" : "Only in taxon"
         },
         {
            "type" : "string",
            "searchable" : "false",
            "display_name" : "Only in taxon (IDs)",
            "id" : "only_in_taxon_closure",
            "indexed" : "true",
            "cardinality" : "multi",
            "description" : "Only in taxon closure.",
            "required" : "false",
            "transform" : [],
            "property" : [
               "getDummyStrings"
            ]
         },
         {
            "property" : [
               "getDummyStrings"
            ],
            "description" : "Only in taxon label closure.",
            "cardinality" : "multi",
            "required" : "false",
            "transform" : [],
            "indexed" : "true",
            "display_name" : "Only in taxon",
            "id" : "only_in_taxon_closure_label",
            "searchable" : "true",
            "type" : "string"
         },
         {
            "type" : "string",
            "searchable" : "false",
            "id" : "annotation_extension_owl_json",
            "display_name" : "Annotation extension",
            "indexed" : "true",
            "transform" : [],
            "required" : "false",
            "description" : "A non-lossy representation of conjunctions and disjunctions in c16 (JSON).",
            "cardinality" : "single",
            "property" : [
               "getDummyString"
            ]
         },
         {
            "searchable" : "false",
            "type" : "string",
            "id" : "annotation_relation",
            "display_name" : "Annotation relation",
            "required" : "false",
            "transform" : [],
            "cardinality" : "single",
            "description" : "This is equivalent to the relation field in GPAD.",
            "indexed" : "true",
            "property" : [
               "getDummyString"
            ]
         },
         {
            "id" : "annotation_relation_label",
            "display_name" : "Annotation relation",
            "searchable" : "true",
            "type" : "string",
            "property" : [
               "getDummyString"
            ],
            "required" : "false",
            "transform" : [],
            "description" : "This is equivalent to the relation field in GPAD.",
            "cardinality" : "single",
            "indexed" : "true"
         },
         {
            "indexed" : "true",
            "required" : "false",
            "transform" : [],
            "cardinality" : "single",
            "description" : "For any class document C, this will contain json(CE) for all axioms of form EquivalentClasses(C ... CE ....).",
            "property" : [
               "getDummyString"
            ],
            "type" : "string",
            "searchable" : "false",
            "id" : "equivalent_class_expressions_json",
            "display_name" : "Eq class expressions"
         },
         {
            "searchable" : "false",
            "type" : "string",
            "display_name" : "Disjoint classes",
            "id" : "disjoint_class_list",
            "cardinality" : "multi",
            "description" : "Disjoint classes.",
            "required" : "false",
            "transform" : [],
            "indexed" : "true",
            "property" : [
               "getDummyStrings"
            ]
         },
         {
            "property" : [
               "getDummyStrings"
            ],
            "required" : "false",
            "transform" : [],
            "description" : "Disjoint classes.",
            "cardinality" : "multi",
            "indexed" : "true",
            "id" : "disjoint_class_list_label",
            "display_name" : "Disjoint classes",
            "searchable" : "true",
            "type" : "string"
         }
      ],
      "_strict" : 0
   },
   "general" : {
      "fields" : [
         {
            "property" : [],
            "transform" : [],
            "required" : "false",
            "description" : "The mangled internal ID for this entity.",
            "cardinality" : "single",
            "indexed" : "true",
            "id" : "id",
            "display_name" : "Internal ID",
            "searchable" : "false",
            "type" : "string"
         },
         {
            "type" : "string",
            "searchable" : "false",
            "display_name" : "Entity",
            "id" : "entity",
            "indexed" : "true",
            "cardinality" : "single",
            "description" : "The ID/label for this entity.",
            "transform" : [],
            "required" : "false",
            "property" : []
         },
         {
            "cardinality" : "single",
            "description" : "The label for this entity.",
            "transform" : [],
            "required" : "false",
            "indexed" : "true",
            "property" : [],
            "searchable" : "true",
            "type" : "string",
            "display_name" : "Enity label",
            "id" : "entity_label"
         },
         {
            "property" : [],
            "indexed" : "true",
            "required" : "false",
            "transform" : [],
            "description" : "The document category that this enitity belongs to.",
            "cardinality" : "single",
            "id" : "category",
            "display_name" : "Document category",
            "type" : "string",
            "searchable" : "false"
         },
         {
            "required" : "false",
            "transform" : [],
            "cardinality" : "single",
            "description" : "A hidden searchable blob document to access this item. It should contain all the goodies that we want to search for, like species(?), synonyms, etc.",
            "indexed" : "true",
            "property" : [],
            "searchable" : "true",
            "type" : "string",
            "id" : "general_blob",
            "display_name" : "Generic blob"
         }
      ],
      "_outfile" : "/home/sjcarbon//local/src/git/amigo/metadata/general-config.yaml",
      "document_category" : "general",
      "id" : "general",
      "boost_weights" : "entity^3.0 entity_label^3.0 general_blob^3.0",
      "schema_generating" : "true",
      "_infile" : "/home/sjcarbon//local/src/git/amigo/metadata/general-config.yaml",
      "display_name" : "General",
      "_strict" : 0,
      "searchable_extension" : "_searchable",
      "weight" : "0",
      "filter_weights" : "category^4.0",
      "description" : "A generic search document to get a general overview of everything.",
      "fields_hash" : {
         "category" : {
            "property" : [],
            "indexed" : "true",
            "required" : "false",
            "transform" : [],
            "description" : "The document category that this enitity belongs to.",
            "cardinality" : "single",
            "id" : "category",
            "display_name" : "Document category",
            "type" : "string",
            "searchable" : "false"
         },
         "entity" : {
            "type" : "string",
            "searchable" : "false",
            "display_name" : "Entity",
            "id" : "entity",
            "indexed" : "true",
            "cardinality" : "single",
            "description" : "The ID/label for this entity.",
            "transform" : [],
            "required" : "false",
            "property" : []
         },
         "general_blob" : {
            "required" : "false",
            "transform" : [],
            "cardinality" : "single",
            "description" : "A hidden searchable blob document to access this item. It should contain all the goodies that we want to search for, like species(?), synonyms, etc.",
            "indexed" : "true",
            "property" : [],
            "searchable" : "true",
            "type" : "string",
            "id" : "general_blob",
            "display_name" : "Generic blob"
         },
         "id" : {
            "property" : [],
            "transform" : [],
            "required" : "false",
            "description" : "The mangled internal ID for this entity.",
            "cardinality" : "single",
            "indexed" : "true",
            "id" : "id",
            "display_name" : "Internal ID",
            "searchable" : "false",
            "type" : "string"
         },
         "entity_label" : {
            "cardinality" : "single",
            "description" : "The label for this entity.",
            "transform" : [],
            "required" : "false",
            "indexed" : "true",
            "property" : [],
            "searchable" : "true",
            "type" : "string",
            "display_name" : "Enity label",
            "id" : "entity_label"
         }
      },
      "result_weights" : "entity^3.0 category^1.0"
   }
};
