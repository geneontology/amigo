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
      "_outfile" : "/home/sjcarbon//local/src/git/amigo/metadata/ont-config.yaml",
      "document_category" : "ontology_class",
      "fields" : [
         {
            "transform" : [],
            "cardinality" : "single",
            "required" : "false",
            "indexed" : "true",
            "property" : [
               "getIdentifier"
            ],
            "description" : "Term identifier.",
            "searchable" : "false",
            "display_name" : "Acc",
            "id" : "id",
            "type" : "string"
         },
         {
            "required" : "false",
            "cardinality" : "single",
            "transform" : [],
            "type" : "string",
            "id" : "annotation_class",
            "display_name" : "Term",
            "searchable" : "false",
            "description" : "Term identifier.",
            "property" : [
               "getIdentifier"
            ],
            "indexed" : "true"
         },
         {
            "type" : "string",
            "id" : "annotation_class_label",
            "display_name" : "Term",
            "searchable" : "true",
            "description" : "Identifier.",
            "property" : [
               "getLabel"
            ],
            "indexed" : "true",
            "required" : "false",
            "cardinality" : "single",
            "transform" : []
         },
         {
            "searchable" : "true",
            "display_name" : "Definition",
            "id" : "description",
            "type" : "string",
            "indexed" : "true",
            "property" : [
               "getDef"
            ],
            "description" : "Term definition.",
            "required" : "false",
            "transform" : [],
            "cardinality" : "single"
         },
         {
            "required" : "false",
            "transform" : [],
            "cardinality" : "single",
            "id" : "source",
            "type" : "string",
            "searchable" : "false",
            "display_name" : "Ontology source",
            "description" : "Term namespace.",
            "indexed" : "true",
            "property" : [
               "getNamespace"
            ]
         },
         {
            "cardinality" : "single",
            "transform" : [],
            "required" : "false",
            "description" : "Term ID space.",
            "property" : [
               "getIdSpace"
            ],
            "indexed" : "true",
            "type" : "string",
            "id" : "idspace",
            "display_name" : "Ontology ID space",
            "searchable" : "false"
         },
         {
            "transform" : [],
            "cardinality" : "single",
            "required" : "false",
            "indexed" : "true",
            "property" : [
               "getIsObsoleteBinaryString"
            ],
            "description" : "Is the term obsolete?",
            "searchable" : "false",
            "display_name" : "Obsoletion",
            "id" : "is_obsolete",
            "type" : "boolean"
         },
         {
            "required" : "false",
            "cardinality" : "multi",
            "transform" : [],
            "display_name" : "Comments",
            "searchable" : "true",
            "type" : "string",
            "id" : "comment",
            "property" : [
               "getComments"
            ],
            "indexed" : "true",
            "description" : "Term comments."
         },
         {
            "cardinality" : "multi",
            "transform" : [],
            "required" : "false",
            "description" : "Term synonyms.",
            "property" : [
               "getOBOSynonymStrings"
            ],
            "indexed" : "true",
            "type" : "string",
            "id" : "synonym",
            "display_name" : "Synonyms",
            "searchable" : "true"
         },
         {
            "required" : "false",
            "transform" : [],
            "cardinality" : "multi",
            "id" : "alternate_id",
            "type" : "string",
            "searchable" : "false",
            "display_name" : "Alt ID",
            "description" : "Alternate term identifier.",
            "indexed" : "true",
            "property" : [
               "getAnnotationPropertyValues",
               "alt_id"
            ]
         },
         {
            "cardinality" : "multi",
            "transform" : [],
            "required" : "false",
            "description" : "Term that replaces this term.",
            "property" : [
               "getAnnotationPropertyValues",
               "replaced_by"
            ],
            "indexed" : "true",
            "type" : "string",
            "id" : "replaced_by",
            "display_name" : "Replaced By",
            "searchable" : "false"
         },
         {
            "cardinality" : "multi",
            "transform" : [],
            "required" : "false",
            "property" : [
               "getAnnotationPropertyValues",
               "consider"
            ],
            "indexed" : "true",
            "description" : "Others terms you might want to look at.",
            "display_name" : "Consider",
            "searchable" : "false",
            "type" : "string",
            "id" : "consider"
         },
         {
            "cardinality" : "multi",
            "transform" : [],
            "required" : "false",
            "property" : [
               "getSubsets"
            ],
            "indexed" : "true",
            "description" : "Special use collections of terms.",
            "display_name" : "Subset",
            "searchable" : "false",
            "type" : "string",
            "id" : "subset"
         },
         {
            "type" : "string",
            "id" : "definition_xref",
            "display_name" : "Def xref",
            "searchable" : "false",
            "description" : "Definition cross-reference.",
            "property" : [
               "getDefXref"
            ],
            "indexed" : "true",
            "required" : "false",
            "cardinality" : "multi",
            "transform" : []
         },
         {
            "description" : "Database cross-reference.",
            "indexed" : "true",
            "property" : [
               "getXref"
            ],
            "id" : "database_xref",
            "type" : "string",
            "searchable" : "false",
            "display_name" : "DB xref",
            "transform" : [],
            "cardinality" : "multi",
            "required" : "false"
         },
         {
            "indexed" : "true",
            "property" : [
               "getRelationIDClosure",
               "BFO:0000050"
            ],
            "description" : "Ancestral terms (is_a/part_of).",
            "searchable" : "false",
            "display_name" : "Is-a/part-of",
            "id" : "isa_partof_closure",
            "type" : "string",
            "transform" : [],
            "cardinality" : "multi",
            "required" : "false"
         },
         {
            "transform" : [],
            "cardinality" : "multi",
            "required" : "false",
            "description" : "Ancestral terms (is_a/part_of).",
            "indexed" : "true",
            "property" : [
               "getRelationLabelClosure",
               "BFO:0000050"
            ],
            "id" : "isa_partof_closure_label",
            "type" : "string",
            "searchable" : "true",
            "display_name" : "Is-a/part-of"
         },
         {
            "searchable" : "false",
            "display_name" : "Ancestor",
            "id" : "regulates_closure",
            "type" : "string",
            "indexed" : "true",
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
            "description" : "Ancestral terms (regulates, occurs in, capable_of).",
            "required" : "false",
            "transform" : [],
            "cardinality" : "multi"
         },
         {
            "required" : "false",
            "cardinality" : "multi",
            "transform" : [],
            "type" : "string",
            "id" : "regulates_closure_label",
            "display_name" : "Ancestor",
            "searchable" : "true",
            "description" : "Ancestral terms (regulates, occurs in, capable_of).",
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
            "indexed" : "true"
         },
         {
            "required" : "false",
            "transform" : [],
            "cardinality" : "single",
            "searchable" : "false",
            "display_name" : "Topology graph (JSON)",
            "id" : "topology_graph_json",
            "type" : "string",
            "indexed" : "false",
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
            "description" : "JSON blob form of the local stepwise topology graph. Uses various relations (including regulates, occurs in, capable_of)."
         },
         {
            "indexed" : "false",
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
            "description" : "JSON blob form of the local relation transitivity graph. Uses various relations (including regulates, occurs in, capable_of).",
            "searchable" : "false",
            "display_name" : "Regulates transitivity graph (JSON)",
            "id" : "regulates_transitivity_graph_json",
            "type" : "string",
            "transform" : [],
            "cardinality" : "single",
            "required" : "false"
         },
         {
            "required" : "false",
            "cardinality" : "single",
            "transform" : [],
            "display_name" : "Only in taxon",
            "searchable" : "true",
            "type" : "string",
            "id" : "only_in_taxon",
            "property" : [
               "getDummyString"
            ],
            "indexed" : "true",
            "description" : "Only in taxon."
         },
         {
            "transform" : [],
            "cardinality" : "single",
            "required" : "false",
            "indexed" : "true",
            "property" : [
               "getDummyString"
            ],
            "description" : "Only in taxon label.",
            "searchable" : "true",
            "display_name" : "Only in taxon",
            "id" : "only_in_taxon_label",
            "type" : "string"
         },
         {
            "required" : "false",
            "transform" : [],
            "cardinality" : "multi",
            "id" : "only_in_taxon_closure",
            "type" : "string",
            "searchable" : "false",
            "display_name" : "Only in taxon (IDs)",
            "description" : "Only in taxon closure.",
            "indexed" : "true",
            "property" : [
               "getDummyStrings"
            ]
         },
         {
            "required" : "false",
            "cardinality" : "multi",
            "transform" : [],
            "display_name" : "Only in taxon",
            "searchable" : "true",
            "type" : "string",
            "id" : "only_in_taxon_closure_label",
            "property" : [
               "getDummyStrings"
            ],
            "indexed" : "true",
            "description" : "Only in taxon label closure."
         },
         {
            "required" : "false",
            "transform" : [],
            "cardinality" : "single",
            "searchable" : "false",
            "display_name" : "Annotation extension",
            "id" : "annotation_extension_owl_json",
            "type" : "string",
            "indexed" : "true",
            "property" : [
               "getDummyString"
            ],
            "description" : "A non-lossy representation of conjunctions and disjunctions in c16 (JSON)."
         },
         {
            "property" : [
               "getDummyString"
            ],
            "indexed" : "true",
            "description" : "This is equivalent to the relation field in GPAD.",
            "display_name" : "Annotation relation",
            "searchable" : "false",
            "type" : "string",
            "id" : "annotation_relation",
            "cardinality" : "single",
            "transform" : [],
            "required" : "false"
         },
         {
            "indexed" : "true",
            "property" : [
               "getDummyString"
            ],
            "description" : "This is equivalent to the relation field in GPAD.",
            "searchable" : "true",
            "display_name" : "Annotation relation",
            "id" : "annotation_relation_label",
            "type" : "string",
            "transform" : [],
            "cardinality" : "single",
            "required" : "false"
         },
         {
            "indexed" : "true",
            "property" : [
               "getDummyString"
            ],
            "description" : "For any class document C, this will contain json(CE) for all axioms of form EquivalentClasses(C ... CE ....).",
            "searchable" : "false",
            "display_name" : "Eq class expressions",
            "id" : "equivalent_class_expressions_json",
            "type" : "string",
            "transform" : [],
            "cardinality" : "single",
            "required" : "false"
         },
         {
            "required" : "false",
            "transform" : [],
            "cardinality" : "multi",
            "id" : "disjoint_class_list",
            "type" : "string",
            "searchable" : "false",
            "display_name" : "Disjoint classes",
            "description" : "Disjoint classes.",
            "indexed" : "true",
            "property" : [
               "getDummyStrings"
            ]
         },
         {
            "required" : "false",
            "transform" : [],
            "cardinality" : "multi",
            "searchable" : "true",
            "display_name" : "Disjoint classes",
            "id" : "disjoint_class_list_label",
            "type" : "string",
            "indexed" : "true",
            "property" : [
               "getDummyStrings"
            ],
            "description" : "Disjoint classes."
         }
      ],
      "fields_hash" : {
         "annotation_relation" : {
            "property" : [
               "getDummyString"
            ],
            "indexed" : "true",
            "description" : "This is equivalent to the relation field in GPAD.",
            "display_name" : "Annotation relation",
            "searchable" : "false",
            "type" : "string",
            "id" : "annotation_relation",
            "cardinality" : "single",
            "transform" : [],
            "required" : "false"
         },
         "regulates_transitivity_graph_json" : {
            "indexed" : "false",
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
            "description" : "JSON blob form of the local relation transitivity graph. Uses various relations (including regulates, occurs in, capable_of).",
            "searchable" : "false",
            "display_name" : "Regulates transitivity graph (JSON)",
            "id" : "regulates_transitivity_graph_json",
            "type" : "string",
            "transform" : [],
            "cardinality" : "single",
            "required" : "false"
         },
         "description" : {
            "searchable" : "true",
            "display_name" : "Definition",
            "id" : "description",
            "type" : "string",
            "indexed" : "true",
            "property" : [
               "getDef"
            ],
            "description" : "Term definition.",
            "required" : "false",
            "transform" : [],
            "cardinality" : "single"
         },
         "annotation_class" : {
            "required" : "false",
            "cardinality" : "single",
            "transform" : [],
            "type" : "string",
            "id" : "annotation_class",
            "display_name" : "Term",
            "searchable" : "false",
            "description" : "Term identifier.",
            "property" : [
               "getIdentifier"
            ],
            "indexed" : "true"
         },
         "replaced_by" : {
            "cardinality" : "multi",
            "transform" : [],
            "required" : "false",
            "description" : "Term that replaces this term.",
            "property" : [
               "getAnnotationPropertyValues",
               "replaced_by"
            ],
            "indexed" : "true",
            "type" : "string",
            "id" : "replaced_by",
            "display_name" : "Replaced By",
            "searchable" : "false"
         },
         "database_xref" : {
            "description" : "Database cross-reference.",
            "indexed" : "true",
            "property" : [
               "getXref"
            ],
            "id" : "database_xref",
            "type" : "string",
            "searchable" : "false",
            "display_name" : "DB xref",
            "transform" : [],
            "cardinality" : "multi",
            "required" : "false"
         },
         "annotation_class_label" : {
            "type" : "string",
            "id" : "annotation_class_label",
            "display_name" : "Term",
            "searchable" : "true",
            "description" : "Identifier.",
            "property" : [
               "getLabel"
            ],
            "indexed" : "true",
            "required" : "false",
            "cardinality" : "single",
            "transform" : []
         },
         "regulates_closure_label" : {
            "required" : "false",
            "cardinality" : "multi",
            "transform" : [],
            "type" : "string",
            "id" : "regulates_closure_label",
            "display_name" : "Ancestor",
            "searchable" : "true",
            "description" : "Ancestral terms (regulates, occurs in, capable_of).",
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
            "indexed" : "true"
         },
         "id" : {
            "transform" : [],
            "cardinality" : "single",
            "required" : "false",
            "indexed" : "true",
            "property" : [
               "getIdentifier"
            ],
            "description" : "Term identifier.",
            "searchable" : "false",
            "display_name" : "Acc",
            "id" : "id",
            "type" : "string"
         },
         "comment" : {
            "required" : "false",
            "cardinality" : "multi",
            "transform" : [],
            "display_name" : "Comments",
            "searchable" : "true",
            "type" : "string",
            "id" : "comment",
            "property" : [
               "getComments"
            ],
            "indexed" : "true",
            "description" : "Term comments."
         },
         "only_in_taxon" : {
            "required" : "false",
            "cardinality" : "single",
            "transform" : [],
            "display_name" : "Only in taxon",
            "searchable" : "true",
            "type" : "string",
            "id" : "only_in_taxon",
            "property" : [
               "getDummyString"
            ],
            "indexed" : "true",
            "description" : "Only in taxon."
         },
         "regulates_closure" : {
            "searchable" : "false",
            "display_name" : "Ancestor",
            "id" : "regulates_closure",
            "type" : "string",
            "indexed" : "true",
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
            "description" : "Ancestral terms (regulates, occurs in, capable_of).",
            "required" : "false",
            "transform" : [],
            "cardinality" : "multi"
         },
         "only_in_taxon_label" : {
            "transform" : [],
            "cardinality" : "single",
            "required" : "false",
            "indexed" : "true",
            "property" : [
               "getDummyString"
            ],
            "description" : "Only in taxon label.",
            "searchable" : "true",
            "display_name" : "Only in taxon",
            "id" : "only_in_taxon_label",
            "type" : "string"
         },
         "topology_graph_json" : {
            "required" : "false",
            "transform" : [],
            "cardinality" : "single",
            "searchable" : "false",
            "display_name" : "Topology graph (JSON)",
            "id" : "topology_graph_json",
            "type" : "string",
            "indexed" : "false",
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
            "description" : "JSON blob form of the local stepwise topology graph. Uses various relations (including regulates, occurs in, capable_of)."
         },
         "consider" : {
            "cardinality" : "multi",
            "transform" : [],
            "required" : "false",
            "property" : [
               "getAnnotationPropertyValues",
               "consider"
            ],
            "indexed" : "true",
            "description" : "Others terms you might want to look at.",
            "display_name" : "Consider",
            "searchable" : "false",
            "type" : "string",
            "id" : "consider"
         },
         "source" : {
            "required" : "false",
            "transform" : [],
            "cardinality" : "single",
            "id" : "source",
            "type" : "string",
            "searchable" : "false",
            "display_name" : "Ontology source",
            "description" : "Term namespace.",
            "indexed" : "true",
            "property" : [
               "getNamespace"
            ]
         },
         "definition_xref" : {
            "type" : "string",
            "id" : "definition_xref",
            "display_name" : "Def xref",
            "searchable" : "false",
            "description" : "Definition cross-reference.",
            "property" : [
               "getDefXref"
            ],
            "indexed" : "true",
            "required" : "false",
            "cardinality" : "multi",
            "transform" : []
         },
         "isa_partof_closure_label" : {
            "transform" : [],
            "cardinality" : "multi",
            "required" : "false",
            "description" : "Ancestral terms (is_a/part_of).",
            "indexed" : "true",
            "property" : [
               "getRelationLabelClosure",
               "BFO:0000050"
            ],
            "id" : "isa_partof_closure_label",
            "type" : "string",
            "searchable" : "true",
            "display_name" : "Is-a/part-of"
         },
         "only_in_taxon_closure" : {
            "required" : "false",
            "transform" : [],
            "cardinality" : "multi",
            "id" : "only_in_taxon_closure",
            "type" : "string",
            "searchable" : "false",
            "display_name" : "Only in taxon (IDs)",
            "description" : "Only in taxon closure.",
            "indexed" : "true",
            "property" : [
               "getDummyStrings"
            ]
         },
         "only_in_taxon_closure_label" : {
            "required" : "false",
            "cardinality" : "multi",
            "transform" : [],
            "display_name" : "Only in taxon",
            "searchable" : "true",
            "type" : "string",
            "id" : "only_in_taxon_closure_label",
            "property" : [
               "getDummyStrings"
            ],
            "indexed" : "true",
            "description" : "Only in taxon label closure."
         },
         "disjoint_class_list_label" : {
            "required" : "false",
            "transform" : [],
            "cardinality" : "multi",
            "searchable" : "true",
            "display_name" : "Disjoint classes",
            "id" : "disjoint_class_list_label",
            "type" : "string",
            "indexed" : "true",
            "property" : [
               "getDummyStrings"
            ],
            "description" : "Disjoint classes."
         },
         "subset" : {
            "cardinality" : "multi",
            "transform" : [],
            "required" : "false",
            "property" : [
               "getSubsets"
            ],
            "indexed" : "true",
            "description" : "Special use collections of terms.",
            "display_name" : "Subset",
            "searchable" : "false",
            "type" : "string",
            "id" : "subset"
         },
         "is_obsolete" : {
            "transform" : [],
            "cardinality" : "single",
            "required" : "false",
            "indexed" : "true",
            "property" : [
               "getIsObsoleteBinaryString"
            ],
            "description" : "Is the term obsolete?",
            "searchable" : "false",
            "display_name" : "Obsoletion",
            "id" : "is_obsolete",
            "type" : "boolean"
         },
         "disjoint_class_list" : {
            "required" : "false",
            "transform" : [],
            "cardinality" : "multi",
            "id" : "disjoint_class_list",
            "type" : "string",
            "searchable" : "false",
            "display_name" : "Disjoint classes",
            "description" : "Disjoint classes.",
            "indexed" : "true",
            "property" : [
               "getDummyStrings"
            ]
         },
         "idspace" : {
            "cardinality" : "single",
            "transform" : [],
            "required" : "false",
            "description" : "Term ID space.",
            "property" : [
               "getIdSpace"
            ],
            "indexed" : "true",
            "type" : "string",
            "id" : "idspace",
            "display_name" : "Ontology ID space",
            "searchable" : "false"
         },
         "synonym" : {
            "cardinality" : "multi",
            "transform" : [],
            "required" : "false",
            "description" : "Term synonyms.",
            "property" : [
               "getOBOSynonymStrings"
            ],
            "indexed" : "true",
            "type" : "string",
            "id" : "synonym",
            "display_name" : "Synonyms",
            "searchable" : "true"
         },
         "annotation_extension_owl_json" : {
            "required" : "false",
            "transform" : [],
            "cardinality" : "single",
            "searchable" : "false",
            "display_name" : "Annotation extension",
            "id" : "annotation_extension_owl_json",
            "type" : "string",
            "indexed" : "true",
            "property" : [
               "getDummyString"
            ],
            "description" : "A non-lossy representation of conjunctions and disjunctions in c16 (JSON)."
         },
         "alternate_id" : {
            "required" : "false",
            "transform" : [],
            "cardinality" : "multi",
            "id" : "alternate_id",
            "type" : "string",
            "searchable" : "false",
            "display_name" : "Alt ID",
            "description" : "Alternate term identifier.",
            "indexed" : "true",
            "property" : [
               "getAnnotationPropertyValues",
               "alt_id"
            ]
         },
         "equivalent_class_expressions_json" : {
            "indexed" : "true",
            "property" : [
               "getDummyString"
            ],
            "description" : "For any class document C, this will contain json(CE) for all axioms of form EquivalentClasses(C ... CE ....).",
            "searchable" : "false",
            "display_name" : "Eq class expressions",
            "id" : "equivalent_class_expressions_json",
            "type" : "string",
            "transform" : [],
            "cardinality" : "single",
            "required" : "false"
         },
         "annotation_relation_label" : {
            "indexed" : "true",
            "property" : [
               "getDummyString"
            ],
            "description" : "This is equivalent to the relation field in GPAD.",
            "searchable" : "true",
            "display_name" : "Annotation relation",
            "id" : "annotation_relation_label",
            "type" : "string",
            "transform" : [],
            "cardinality" : "single",
            "required" : "false"
         },
         "isa_partof_closure" : {
            "indexed" : "true",
            "property" : [
               "getRelationIDClosure",
               "BFO:0000050"
            ],
            "description" : "Ancestral terms (is_a/part_of).",
            "searchable" : "false",
            "display_name" : "Is-a/part-of",
            "id" : "isa_partof_closure",
            "type" : "string",
            "transform" : [],
            "cardinality" : "multi",
            "required" : "false"
         }
      },
      "filter_weights" : "source^4.0 idspace^3.5 subset^3.0 is_obsolete^0.0",
      "_infile" : "/home/sjcarbon//local/src/git/amigo/metadata/ont-config.yaml",
      "weight" : "40",
      "display_name" : "Ontology",
      "id" : "ontology",
      "boost_weights" : "annotation_class^3.0 annotation_class_label^5.5 description^1.0 comment^0.5 synonym^1.0 alternate_id^1.0 regulates_closure^1.0 regulates_closure_label^1.0",
      "searchable_extension" : "_searchable",
      "description" : "Gene Ontology Term, Synonym, or Definition.",
      "result_weights" : "annotation_class^8.0 description^6.0 source^4.0 idspace^3.5 synonym^3.0 alternate_id^2.0",
      "schema_generating" : "true",
      "_strict" : 0
   },
   "general" : {
      "schema_generating" : "true",
      "_strict" : 0,
      "result_weights" : "entity^3.0 category^1.0",
      "description" : "A generic search document to get a general overview of everything.",
      "searchable_extension" : "_searchable",
      "boost_weights" : "entity^3.0 entity_label^3.0 general_blob^3.0",
      "id" : "general",
      "display_name" : "General",
      "weight" : "0",
      "_infile" : "/home/sjcarbon//local/src/git/amigo/metadata/general-config.yaml",
      "filter_weights" : "category^4.0",
      "fields_hash" : {
         "id" : {
            "required" : "false",
            "cardinality" : "single",
            "transform" : [],
            "display_name" : "Internal ID",
            "searchable" : "false",
            "type" : "string",
            "id" : "id",
            "property" : [],
            "indexed" : "true",
            "description" : "The mangled internal ID for this entity."
         },
         "entity" : {
            "description" : "The ID/label for this entity.",
            "indexed" : "true",
            "property" : [],
            "id" : "entity",
            "type" : "string",
            "searchable" : "false",
            "display_name" : "Entity",
            "transform" : [],
            "cardinality" : "single",
            "required" : "false"
         },
         "entity_label" : {
            "transform" : [],
            "cardinality" : "single",
            "required" : "false",
            "indexed" : "true",
            "property" : [],
            "description" : "The label for this entity.",
            "searchable" : "true",
            "display_name" : "Enity label",
            "id" : "entity_label",
            "type" : "string"
         },
         "general_blob" : {
            "display_name" : "Generic blob",
            "searchable" : "true",
            "type" : "string",
            "id" : "general_blob",
            "property" : [],
            "indexed" : "true",
            "description" : "A hidden searchable blob document to access this item. It should contain all the goodies that we want to search for, like species(?), synonyms, etc.",
            "required" : "false",
            "cardinality" : "single",
            "transform" : []
         },
         "category" : {
            "description" : "The document category that this enitity belongs to.",
            "indexed" : "true",
            "property" : [],
            "id" : "category",
            "type" : "string",
            "searchable" : "false",
            "display_name" : "Document category",
            "transform" : [],
            "cardinality" : "single",
            "required" : "false"
         }
      },
      "fields" : [
         {
            "required" : "false",
            "cardinality" : "single",
            "transform" : [],
            "display_name" : "Internal ID",
            "searchable" : "false",
            "type" : "string",
            "id" : "id",
            "property" : [],
            "indexed" : "true",
            "description" : "The mangled internal ID for this entity."
         },
         {
            "description" : "The ID/label for this entity.",
            "indexed" : "true",
            "property" : [],
            "id" : "entity",
            "type" : "string",
            "searchable" : "false",
            "display_name" : "Entity",
            "transform" : [],
            "cardinality" : "single",
            "required" : "false"
         },
         {
            "transform" : [],
            "cardinality" : "single",
            "required" : "false",
            "indexed" : "true",
            "property" : [],
            "description" : "The label for this entity.",
            "searchable" : "true",
            "display_name" : "Enity label",
            "id" : "entity_label",
            "type" : "string"
         },
         {
            "description" : "The document category that this enitity belongs to.",
            "indexed" : "true",
            "property" : [],
            "id" : "category",
            "type" : "string",
            "searchable" : "false",
            "display_name" : "Document category",
            "transform" : [],
            "cardinality" : "single",
            "required" : "false"
         },
         {
            "display_name" : "Generic blob",
            "searchable" : "true",
            "type" : "string",
            "id" : "general_blob",
            "property" : [],
            "indexed" : "true",
            "description" : "A hidden searchable blob document to access this item. It should contain all the goodies that we want to search for, like species(?), synonyms, etc.",
            "required" : "false",
            "cardinality" : "single",
            "transform" : []
         }
      ],
      "document_category" : "general",
      "_outfile" : "/home/sjcarbon//local/src/git/amigo/metadata/general-config.yaml"
   }
};
