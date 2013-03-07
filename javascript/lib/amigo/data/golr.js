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
bbop.core.require('bbop', 'core');
bbop.core.namespace('amigo', 'data', 'golr');

/*
 * Variable: golr
 * 
 * The configuration for the data.
 * Essentially a JSONification of the OWLTools YAML files.
 * This should be consumed directly by <bbop.golr.conf>.
 */
amigo.data.golr = {
   "bbop_bio" : {
      "searchable_extension" : "_searchable",
      "result_weights" : "bioentity^6.0 bioentity_name^5.0 taxon^4.0 family_tag^3.0 type^2.0 source^1.0 taxon_closure_label^1.0",
      "filter_weights" : "source^7.0 type^6.0 family_tag_label^5.0 taxon_closure_label^4.0 isa_partof_closure_label^3.0 regulates_closure_label^2.0",
      "_infile" : "/home/sjcarbon/local/src/git/amigo/metadata//bio-config.yaml",
      "display_name" : "Gene/products",
      "description" : "A description of bioentities file for GOlr.",
      "boost_weights" : "bioentity^2.0 bioentity_label^2.0 bioentity_name^1.0 isa_partof_closure_label^1.0 regulates_closure_label^1.0 family_tag^1.0 family_tag_label^1.0 taxon_closure_label^1.0",
      "fields" : [
         {
            "transform" : [],
            "description" : "Gene/product ID.",
            "display_name" : "Acc",
            "indexed" : "true",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "single",
            "type" : "string",
            "id" : "id",
            "property" : []
         },
         {
            "transform" : [],
            "description" : "Gene/product ID.",
            "display_name" : "Acc",
            "indexed" : "true",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "single",
            "type" : "string",
            "id" : "bioentity",
            "property" : []
         },
         {
            "transform" : [],
            "description" : "Symbol or name.",
            "display_name" : "Label",
            "indexed" : "true",
            "searchable" : "true",
            "required" : "false",
            "cardinality" : "single",
            "type" : "string",
            "id" : "bioentity_label",
            "property" : []
         },
         {
            "transform" : [],
            "description" : "The full name of the gene product.",
            "display_name" : "Name",
            "indexed" : "true",
            "searchable" : "true",
            "required" : "false",
            "cardinality" : "single",
            "type" : "string",
            "id" : "bioentity_name",
            "property" : []
         },
         {
            "transform" : [],
            "description" : "The bioentity ID used at the database of origin.",
            "display_name" : "This should not be displayed",
            "indexed" : "false",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "single",
            "type" : "string",
            "id" : "bioentity_internal_id",
            "property" : []
         },
         {
            "transform" : [],
            "description" : "Column 12: type class id.",
            "display_name" : "Type class id",
            "indexed" : "true",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "single",
            "type" : "string",
            "id" : "type",
            "property" : []
         },
         {
            "transform" : [],
            "description" : "Column 13: taxon.",
            "display_name" : "Taxon",
            "indexed" : "true",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "single",
            "type" : "string",
            "id" : "taxon",
            "property" : []
         },
         {
            "transform" : [],
            "description" : "Derived from C13 + ncbi_taxonomy.obo.",
            "display_name" : "Taxon",
            "indexed" : "true",
            "searchable" : "true",
            "required" : "false",
            "cardinality" : "single",
            "type" : "string",
            "id" : "taxon_label",
            "property" : []
         },
         {
            "transform" : [],
            "description" : "IDs derived from C13 + ncbi_taxonomy.obo.",
            "display_name" : "Taxon (IDs)",
            "indexed" : "true",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "multi",
            "type" : "string",
            "id" : "taxon_closure",
            "property" : []
         },
         {
            "transform" : [],
            "description" : "Labels derived from C13 + ncbi_taxonomy.obo.",
            "display_name" : "Taxon",
            "indexed" : "true",
            "searchable" : "true",
            "required" : "false",
            "cardinality" : "multi",
            "type" : "string",
            "id" : "taxon_closure_label",
            "property" : []
         },
         {
            "transform" : [],
            "description" : "Closure of ids/accs over isa and partof.",
            "display_name" : "Involved in (IDs)",
            "indexed" : "true",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "multi",
            "type" : "string",
            "id" : "isa_partof_closure",
            "property" : []
         },
         {
            "transform" : [],
            "description" : "Closure of labels over isa and partof.",
            "display_name" : "Involved in",
            "indexed" : "true",
            "searchable" : "true",
            "required" : "false",
            "cardinality" : "multi",
            "type" : "string",
            "id" : "isa_partof_closure_label",
            "property" : []
         },
         {
            "transform" : [],
            "description" : "Closure of ids/accs over regulates.",
            "display_name" : "Regulates + involved in (IDs)",
            "indexed" : "true",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "multi",
            "type" : "string",
            "id" : "regulates_closure",
            "property" : []
         },
         {
            "transform" : [],
            "description" : "Closure of labels over regulates.",
            "display_name" : "Regulates + involved in",
            "indexed" : "true",
            "searchable" : "true",
            "required" : "false",
            "cardinality" : "multi",
            "type" : "string",
            "id" : "regulates_closure_label",
            "property" : []
         },
         {
            "transform" : [],
            "description" : "Column 1: database source.",
            "display_name" : "Source",
            "indexed" : "true",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "single",
            "type" : "string",
            "id" : "source",
            "property" : []
         },
         {
            "transform" : [],
            "description" : "Gene product synonyms.",
            "display_name" : "Synonym",
            "indexed" : "true",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "multi",
            "type" : "string",
            "id" : "synonym",
            "property" : []
         },
         {
            "transform" : [],
            "description" : "Family IDs that are associated with this entity.",
            "display_name" : "Protein family",
            "indexed" : "true",
            "searchable" : "true",
            "required" : "false",
            "cardinality" : "multi",
            "type" : "string",
            "id" : "family_tag",
            "property" : []
         },
         {
            "transform" : [],
            "description" : "Families that are associated with this entity.",
            "display_name" : "Family",
            "indexed" : "true",
            "searchable" : "true",
            "required" : "false",
            "cardinality" : "multi",
            "type" : "string",
            "id" : "family_tag_label",
            "property" : []
         },
         {
            "transform" : [],
            "description" : "JSON blob form of the phylogenic tree.",
            "display_name" : "This should not be displayed",
            "indexed" : "false",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "single",
            "type" : "string",
            "id" : "phylo_graph",
            "property" : []
         },
         {
            "transform" : [],
            "description" : "Database cross-reference.",
            "display_name" : "DB xref",
            "indexed" : "true",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "multi",
            "type" : "string",
            "id" : "database_xref",
            "property" : []
         }
      ],
      "fields_hash" : {
         "source" : {
            "transform" : [],
            "description" : "Column 1: database source.",
            "display_name" : "Source",
            "indexed" : "true",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "single",
            "type" : "string",
            "id" : "source",
            "property" : []
         },
         "bioentity_label" : {
            "transform" : [],
            "description" : "Symbol or name.",
            "display_name" : "Label",
            "indexed" : "true",
            "searchable" : "true",
            "required" : "false",
            "cardinality" : "single",
            "type" : "string",
            "id" : "bioentity_label",
            "property" : []
         },
         "database_xref" : {
            "transform" : [],
            "description" : "Database cross-reference.",
            "display_name" : "DB xref",
            "indexed" : "true",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "multi",
            "type" : "string",
            "id" : "database_xref",
            "property" : []
         },
         "taxon_closure_label" : {
            "transform" : [],
            "description" : "Labels derived from C13 + ncbi_taxonomy.obo.",
            "display_name" : "Taxon",
            "indexed" : "true",
            "searchable" : "true",
            "required" : "false",
            "cardinality" : "multi",
            "type" : "string",
            "id" : "taxon_closure_label",
            "property" : []
         },
         "phylo_graph" : {
            "transform" : [],
            "description" : "JSON blob form of the phylogenic tree.",
            "display_name" : "This should not be displayed",
            "indexed" : "false",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "single",
            "type" : "string",
            "id" : "phylo_graph",
            "property" : []
         },
         "bioentity_name" : {
            "transform" : [],
            "description" : "The full name of the gene product.",
            "display_name" : "Name",
            "indexed" : "true",
            "searchable" : "true",
            "required" : "false",
            "cardinality" : "single",
            "type" : "string",
            "id" : "bioentity_name",
            "property" : []
         },
         "bioentity_internal_id" : {
            "transform" : [],
            "description" : "The bioentity ID used at the database of origin.",
            "display_name" : "This should not be displayed",
            "indexed" : "false",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "single",
            "type" : "string",
            "id" : "bioentity_internal_id",
            "property" : []
         },
         "id" : {
            "transform" : [],
            "description" : "Gene/product ID.",
            "display_name" : "Acc",
            "indexed" : "true",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "single",
            "type" : "string",
            "id" : "id",
            "property" : []
         },
         "taxon_closure" : {
            "transform" : [],
            "description" : "IDs derived from C13 + ncbi_taxonomy.obo.",
            "display_name" : "Taxon (IDs)",
            "indexed" : "true",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "multi",
            "type" : "string",
            "id" : "taxon_closure",
            "property" : []
         },
         "isa_partof_closure_label" : {
            "transform" : [],
            "description" : "Closure of labels over isa and partof.",
            "display_name" : "Involved in",
            "indexed" : "true",
            "searchable" : "true",
            "required" : "false",
            "cardinality" : "multi",
            "type" : "string",
            "id" : "isa_partof_closure_label",
            "property" : []
         },
         "family_tag" : {
            "transform" : [],
            "description" : "Family IDs that are associated with this entity.",
            "display_name" : "Protein family",
            "indexed" : "true",
            "searchable" : "true",
            "required" : "false",
            "cardinality" : "multi",
            "type" : "string",
            "id" : "family_tag",
            "property" : []
         },
         "taxon" : {
            "transform" : [],
            "description" : "Column 13: taxon.",
            "display_name" : "Taxon",
            "indexed" : "true",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "single",
            "type" : "string",
            "id" : "taxon",
            "property" : []
         },
         "regulates_closure_label" : {
            "transform" : [],
            "description" : "Closure of labels over regulates.",
            "display_name" : "Regulates + involved in",
            "indexed" : "true",
            "searchable" : "true",
            "required" : "false",
            "cardinality" : "multi",
            "type" : "string",
            "id" : "regulates_closure_label",
            "property" : []
         },
         "regulates_closure" : {
            "transform" : [],
            "description" : "Closure of ids/accs over regulates.",
            "display_name" : "Regulates + involved in (IDs)",
            "indexed" : "true",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "multi",
            "type" : "string",
            "id" : "regulates_closure",
            "property" : []
         },
         "bioentity" : {
            "transform" : [],
            "description" : "Gene/product ID.",
            "display_name" : "Acc",
            "indexed" : "true",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "single",
            "type" : "string",
            "id" : "bioentity",
            "property" : []
         },
         "isa_partof_closure" : {
            "transform" : [],
            "description" : "Closure of ids/accs over isa and partof.",
            "display_name" : "Involved in (IDs)",
            "indexed" : "true",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "multi",
            "type" : "string",
            "id" : "isa_partof_closure",
            "property" : []
         },
         "taxon_label" : {
            "transform" : [],
            "description" : "Derived from C13 + ncbi_taxonomy.obo.",
            "display_name" : "Taxon",
            "indexed" : "true",
            "searchable" : "true",
            "required" : "false",
            "cardinality" : "single",
            "type" : "string",
            "id" : "taxon_label",
            "property" : []
         },
         "synonym" : {
            "transform" : [],
            "description" : "Gene product synonyms.",
            "display_name" : "Synonym",
            "indexed" : "true",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "multi",
            "type" : "string",
            "id" : "synonym",
            "property" : []
         },
         "family_tag_label" : {
            "transform" : [],
            "description" : "Families that are associated with this entity.",
            "display_name" : "Family",
            "indexed" : "true",
            "searchable" : "true",
            "required" : "false",
            "cardinality" : "multi",
            "type" : "string",
            "id" : "family_tag_label",
            "property" : []
         },
         "type" : {
            "transform" : [],
            "description" : "Column 12: type class id.",
            "display_name" : "Type class id",
            "indexed" : "true",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "single",
            "type" : "string",
            "id" : "type",
            "property" : []
         }
      },
      "document_category" : "bioentity",
      "weight" : "30",
      "_strict" : 0,
      "id" : "bbop_bio",
      "_outfile" : "/home/sjcarbon/local/src/git/amigo/metadata//bio-config.yaml"
   },
   "bbop_ann_ev_agg" : {
      "searchable_extension" : "_searchable",
      "result_weights" : "bioentity^4.0 annotation_class^3.0 taxon^2.0",
      "filter_weights" : "evidence_type_closure^4.0 evidence_with^3.0 taxon_closure_label^2.0",
      "_infile" : "/home/sjcarbon/local/src/git/amigo/metadata//ann_ev_agg-config.yaml",
      "display_name" : "Advanced",
      "description" : "A description of annotation evidence aggregate for GOlr and AmiGO.",
      "boost_weights" : "annotation_class^2.0 annotation_class_label^1.0 bioentity^2.0 bioentity_label^1.0 family_tag^1.0 family_tag_label^1.0 taxon_closure_label^1.0",
      "fields" : [
         {
            "transform" : [],
            "description" : "Gene/product ID.",
            "display_name" : "Acc",
            "indexed" : "true",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "single",
            "type" : "string",
            "id" : "id",
            "property" : []
         },
         {
            "transform" : [],
            "description" : "Column 1 + columns 2.",
            "display_name" : "Gene/product ID",
            "indexed" : "true",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "single",
            "type" : "string",
            "id" : "bioentity",
            "property" : []
         },
         {
            "transform" : [],
            "description" : "Column 3.",
            "display_name" : "Gene/product label",
            "indexed" : "true",
            "searchable" : "true",
            "required" : "false",
            "cardinality" : "single",
            "type" : "string",
            "id" : "bioentity_label",
            "property" : []
         },
         {
            "transform" : [],
            "description" : "Column 5.",
            "display_name" : "Annotation class",
            "indexed" : "true",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "single",
            "type" : "string",
            "id" : "annotation_class",
            "property" : []
         },
         {
            "transform" : [],
            "description" : "Column 5 + ontology.",
            "display_name" : "Annotation class label",
            "indexed" : "true",
            "searchable" : "true",
            "required" : "false",
            "cardinality" : "single",
            "type" : "string",
            "id" : "annotation_class_label",
            "property" : []
         },
         {
            "transform" : [],
            "description" : "All evidence for this term/gene product pair",
            "display_name" : "Evidence type",
            "indexed" : "true",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "multi",
            "type" : "string",
            "id" : "evidence_type_closure",
            "property" : []
         },
         {
            "transform" : [],
            "description" : "All column 8s for this term/gene product pair",
            "display_name" : "Evidence with",
            "indexed" : "true",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "multi",
            "type" : "string",
            "id" : "evidence_with",
            "property" : []
         },
         {
            "transform" : [],
            "description" : "Column 13: taxon.",
            "display_name" : "Taxon",
            "indexed" : "true",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "single",
            "type" : "string",
            "id" : "taxon",
            "property" : []
         },
         {
            "transform" : [],
            "description" : "Derived from C13 + ncbi_taxonomy.obo.",
            "display_name" : "Taxon",
            "indexed" : "true",
            "searchable" : "true",
            "required" : "false",
            "cardinality" : "single",
            "type" : "string",
            "id" : "taxon_label",
            "property" : []
         },
         {
            "transform" : [],
            "description" : "IDs derived from C13 + ncbi_taxonomy.obo.",
            "display_name" : "Taxon (IDs)",
            "indexed" : "true",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "multi",
            "type" : "string",
            "id" : "taxon_closure",
            "property" : []
         },
         {
            "transform" : [],
            "description" : "Labels derived from C13 + ncbi_taxonomy.obo.",
            "display_name" : "Taxon",
            "indexed" : "true",
            "searchable" : "true",
            "required" : "false",
            "cardinality" : "multi",
            "type" : "string",
            "id" : "taxon_closure_label",
            "property" : []
         },
         {
            "transform" : [],
            "description" : "Family IDs that are associated with this entity.",
            "display_name" : "Protein family",
            "indexed" : "true",
            "searchable" : "true",
            "required" : "false",
            "cardinality" : "multi",
            "type" : "string",
            "id" : "family_tag",
            "property" : []
         },
         {
            "transform" : [],
            "description" : "Families that are associated with this entity.",
            "display_name" : "Family",
            "indexed" : "true",
            "searchable" : "true",
            "required" : "false",
            "cardinality" : "multi",
            "type" : "string",
            "id" : "family_tag_label",
            "property" : []
         }
      ],
      "fields_hash" : {
         "family_tag" : {
            "transform" : [],
            "description" : "Family IDs that are associated with this entity.",
            "display_name" : "Protein family",
            "indexed" : "true",
            "searchable" : "true",
            "required" : "false",
            "cardinality" : "multi",
            "type" : "string",
            "id" : "family_tag",
            "property" : []
         },
         "bioentity_label" : {
            "transform" : [],
            "description" : "Column 3.",
            "display_name" : "Gene/product label",
            "indexed" : "true",
            "searchable" : "true",
            "required" : "false",
            "cardinality" : "single",
            "type" : "string",
            "id" : "bioentity_label",
            "property" : []
         },
         "taxon_closure_label" : {
            "transform" : [],
            "description" : "Labels derived from C13 + ncbi_taxonomy.obo.",
            "display_name" : "Taxon",
            "indexed" : "true",
            "searchable" : "true",
            "required" : "false",
            "cardinality" : "multi",
            "type" : "string",
            "id" : "taxon_closure_label",
            "property" : []
         },
         "annotation_class" : {
            "transform" : [],
            "description" : "Column 5.",
            "display_name" : "Annotation class",
            "indexed" : "true",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "single",
            "type" : "string",
            "id" : "annotation_class",
            "property" : []
         },
         "taxon" : {
            "transform" : [],
            "description" : "Column 13: taxon.",
            "display_name" : "Taxon",
            "indexed" : "true",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "single",
            "type" : "string",
            "id" : "taxon",
            "property" : []
         },
         "bioentity" : {
            "transform" : [],
            "description" : "Column 1 + columns 2.",
            "display_name" : "Gene/product ID",
            "indexed" : "true",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "single",
            "type" : "string",
            "id" : "bioentity",
            "property" : []
         },
         "annotation_class_label" : {
            "transform" : [],
            "description" : "Column 5 + ontology.",
            "display_name" : "Annotation class label",
            "indexed" : "true",
            "searchable" : "true",
            "required" : "false",
            "cardinality" : "single",
            "type" : "string",
            "id" : "annotation_class_label",
            "property" : []
         },
         "taxon_label" : {
            "transform" : [],
            "description" : "Derived from C13 + ncbi_taxonomy.obo.",
            "display_name" : "Taxon",
            "indexed" : "true",
            "searchable" : "true",
            "required" : "false",
            "cardinality" : "single",
            "type" : "string",
            "id" : "taxon_label",
            "property" : []
         },
         "evidence_type_closure" : {
            "transform" : [],
            "description" : "All evidence for this term/gene product pair",
            "display_name" : "Evidence type",
            "indexed" : "true",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "multi",
            "type" : "string",
            "id" : "evidence_type_closure",
            "property" : []
         },
         "family_tag_label" : {
            "transform" : [],
            "description" : "Families that are associated with this entity.",
            "display_name" : "Family",
            "indexed" : "true",
            "searchable" : "true",
            "required" : "false",
            "cardinality" : "multi",
            "type" : "string",
            "id" : "family_tag_label",
            "property" : []
         },
         "id" : {
            "transform" : [],
            "description" : "Gene/product ID.",
            "display_name" : "Acc",
            "indexed" : "true",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "single",
            "type" : "string",
            "id" : "id",
            "property" : []
         },
         "evidence_with" : {
            "transform" : [],
            "description" : "All column 8s for this term/gene product pair",
            "display_name" : "Evidence with",
            "indexed" : "true",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "multi",
            "type" : "string",
            "id" : "evidence_with",
            "property" : []
         },
         "taxon_closure" : {
            "transform" : [],
            "description" : "IDs derived from C13 + ncbi_taxonomy.obo.",
            "display_name" : "Taxon (IDs)",
            "indexed" : "true",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "multi",
            "type" : "string",
            "id" : "taxon_closure",
            "property" : []
         }
      },
      "document_category" : "annotation_evidence_aggregate",
      "weight" : "10",
      "_strict" : 0,
      "id" : "bbop_ann_ev_agg",
      "_outfile" : "/home/sjcarbon/local/src/git/amigo/metadata//ann_ev_agg-config.yaml"
   },
   "bbop_ann" : {
      "searchable_extension" : "_searchable",
      "result_weights" : "annotation_class^9.0 evidence_type^8.0 bioentity^7.0 bioentity_name^5.0 source^4.0 taxon^3.0 evidence_with^2.0 family_tag^1.5 annotation_extension_class^1.0 bioentity_isoform^0.5",
      "filter_weights" : "source^7.0 assigned_by^6.5 aspect^6.25 evidence_type_closure^6.0 family_tag_label^5.5 taxon_closure_label^5.0 isa_partof_closure_label^4.0 regulates_closure_label^3.0 annotation_extension_class_closure_label^2.0",
      "_infile" : "/home/sjcarbon/local/src/git/amigo/metadata//ann-config.yaml",
      "display_name" : "Annotations",
      "description" : "A description of annotations for GOlr and AmiGO.",
      "boost_weights" : "annotation_class^2.0 annotation_class_label^1.0 bioentity^2.0 bioentity_label^1.0 bioentity_name^1.0 annotation_extension_class^2.0 annotation_extension_class_label^1.0 family_tag^1.0 family_tag_label^1.0 bioentity_isoform^1.0",
      "fields" : [
         {
            "transform" : [],
            "description" : "A unique (and internal) combination of bioentity and ontology class.",
            "display_name" : "Acc",
            "indexed" : "true",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "single",
            "type" : "string",
            "id" : "id",
            "property" : []
         },
         {
            "transform" : [],
            "description" : "Column 1: database source.",
            "display_name" : "Source",
            "indexed" : "true",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "single",
            "type" : "string",
            "id" : "source",
            "property" : []
         },
         {
            "transform" : [],
            "description" : "Column 12: type class id.",
            "display_name" : "Type class id",
            "indexed" : "true",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "single",
            "type" : "string",
            "id" : "type",
            "property" : []
         },
         {
            "transform" : [],
            "description" : "Column 14: date of assignment.",
            "display_name" : "Date",
            "indexed" : "true",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "single",
            "type" : "string",
            "id" : "date",
            "property" : []
         },
         {
            "transform" : [],
            "description" : "Column 15: assigned by.",
            "display_name" : "Assigned by",
            "indexed" : "true",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "single",
            "type" : "string",
            "id" : "assigned_by",
            "property" : []
         },
         {
            "transform" : [],
            "description" : "Column 13: taxon.",
            "display_name" : "Taxon",
            "indexed" : "true",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "single",
            "type" : "string",
            "id" : "taxon",
            "property" : []
         },
         {
            "transform" : [],
            "description" : "Derived from C13 + ncbi_taxonomy.obo.",
            "display_name" : "Taxon",
            "indexed" : "true",
            "searchable" : "true",
            "required" : "false",
            "cardinality" : "single",
            "type" : "string",
            "id" : "taxon_label",
            "property" : []
         },
         {
            "transform" : [],
            "description" : "IDs derived from C13 + ncbi_taxonomy.obo.",
            "display_name" : "Taxon (IDs)",
            "indexed" : "true",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "multi",
            "type" : "string",
            "id" : "taxon_closure",
            "property" : []
         },
         {
            "transform" : [],
            "description" : "Labels derived from C13 + ncbi_taxonomy.obo.",
            "display_name" : "Taxon",
            "indexed" : "true",
            "searchable" : "true",
            "required" : "false",
            "cardinality" : "multi",
            "type" : "string",
            "id" : "taxon_closure_label",
            "property" : []
         },
         {
            "transform" : [],
            "description" : "Closure of ids/accs over isa and partof.",
            "display_name" : "Involved in (IDs)",
            "indexed" : "true",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "multi",
            "type" : "string",
            "id" : "isa_partof_closure",
            "property" : []
         },
         {
            "transform" : [],
            "description" : "Closure of labels over isa and partof.",
            "display_name" : "Involved in",
            "indexed" : "true",
            "searchable" : "true",
            "required" : "false",
            "cardinality" : "multi",
            "type" : "string",
            "id" : "isa_partof_closure_label",
            "property" : []
         },
         {
            "transform" : [],
            "description" : "Closure of ids/accs over regulates.",
            "display_name" : "Regulates + involved in (IDs)",
            "indexed" : "true",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "multi",
            "type" : "string",
            "id" : "regulates_closure",
            "property" : []
         },
         {
            "transform" : [],
            "description" : "Closure of labels over regulates.",
            "display_name" : "Regulates + involved in",
            "indexed" : "true",
            "searchable" : "true",
            "required" : "false",
            "cardinality" : "multi",
            "type" : "string",
            "id" : "regulates_closure_label",
            "property" : []
         },
         {
            "transform" : [],
            "description" : "Column 11: gene product synonyms.",
            "display_name" : "Synonym",
            "indexed" : "true",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "multi",
            "type" : "string",
            "id" : "synonym",
            "property" : []
         },
         {
            "transform" : [],
            "description" : "Column 1 + columns 2.",
            "display_name" : "Gene/Product",
            "indexed" : "true",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "single",
            "type" : "string",
            "id" : "bioentity",
            "property" : []
         },
         {
            "transform" : [],
            "description" : "Column 3: bioentity label.",
            "display_name" : "Gene/product label",
            "indexed" : "true",
            "searchable" : "true",
            "required" : "false",
            "cardinality" : "single",
            "type" : "string",
            "id" : "bioentity_label",
            "property" : []
         },
         {
            "transform" : [],
            "description" : "The full name of the gene product.",
            "display_name" : "Gene/Product name",
            "indexed" : "true",
            "searchable" : "true",
            "required" : "false",
            "cardinality" : "single",
            "type" : "string",
            "id" : "bioentity_name",
            "property" : []
         },
         {
            "transform" : [],
            "description" : "The bioentity ID used at the database of origin.",
            "display_name" : "This should not be displayed",
            "indexed" : "false",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "single",
            "type" : "string",
            "id" : "bioentity_internal_id",
            "property" : []
         },
         {
            "transform" : [],
            "description" : "Derived from column 4.",
            "display_name" : "Qualifier",
            "indexed" : "true",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "multi",
            "type" : "string",
            "id" : "qualifier",
            "property" : []
         },
         {
            "transform" : [],
            "description" : "Column 5.",
            "display_name" : "Annotation class",
            "indexed" : "true",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "single",
            "type" : "string",
            "id" : "annotation_class",
            "property" : []
         },
         {
            "transform" : [],
            "description" : "Column 5 + ontology.",
            "display_name" : "Annotation class label",
            "indexed" : "true",
            "searchable" : "true",
            "required" : "false",
            "cardinality" : "single",
            "type" : "string",
            "id" : "annotation_class_label",
            "property" : []
         },
         {
            "transform" : [],
            "description" : "Column 9: Ontology aspect.",
            "display_name" : "Ontology (aspect)",
            "indexed" : "true",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "single",
            "type" : "string",
            "id" : "aspect",
            "property" : []
         },
         {
            "transform" : [],
            "description" : "Column 17: Bioentity isoform.",
            "display_name" : "Isoform",
            "indexed" : "true",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "single",
            "type" : "string",
            "id" : "bioentity_isoform",
            "property" : []
         },
         {
            "transform" : [],
            "description" : "Column 7: evidence type.",
            "display_name" : "Evidence",
            "indexed" : "true",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "single",
            "type" : "string",
            "id" : "evidence_type",
            "property" : []
         },
         {
            "transform" : [],
            "description" : "All evidence (evidence closure) for this annotation",
            "display_name" : "Evidence type (inferred)",
            "indexed" : "true",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "multi",
            "type" : "string",
            "id" : "evidence_type_closure",
            "property" : []
         },
         {
            "transform" : [],
            "description" : "Column 8: with/from.",
            "display_name" : "Evidence with",
            "indexed" : "true",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "multi",
            "type" : "string",
            "id" : "evidence_with",
            "property" : []
         },
         {
            "transform" : [],
            "description" : "Column 6: database reference.",
            "display_name" : "Reference",
            "indexed" : "true",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "single",
            "type" : "string",
            "id" : "reference",
            "property" : []
         },
         {
            "transform" : [],
            "description" : "Column 16: extension class for the annotation.",
            "display_name" : "Annotation extension",
            "indexed" : "true",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "multi",
            "type" : "string",
            "id" : "annotation_extension_class",
            "property" : []
         },
         {
            "transform" : [],
            "description" : "???",
            "display_name" : "Annotation extension (labels)",
            "indexed" : "true",
            "searchable" : "true",
            "required" : "false",
            "cardinality" : "multi",
            "type" : "string",
            "id" : "annotation_extension_class_label",
            "property" : []
         },
         {
            "transform" : [],
            "description" : "???",
            "display_name" : "Annotation extension (IDs)",
            "indexed" : "true",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "multi",
            "type" : "string",
            "id" : "annotation_extension_class_closure",
            "property" : []
         },
         {
            "transform" : [],
            "description" : "???",
            "display_name" : "Annotation extension",
            "indexed" : "true",
            "searchable" : "true",
            "required" : "false",
            "cardinality" : "multi",
            "type" : "string",
            "id" : "annotation_extension_class_closure_label",
            "property" : []
         },
         {
            "transform" : [],
            "description" : "Family IDs that are associated with this entity.",
            "display_name" : "Protein family",
            "indexed" : "true",
            "searchable" : "true",
            "required" : "false",
            "cardinality" : "multi",
            "type" : "string",
            "id" : "family_tag",
            "property" : []
         },
         {
            "transform" : [],
            "description" : "Families that are associated with this entity.",
            "display_name" : "Family",
            "indexed" : "true",
            "searchable" : "true",
            "required" : "false",
            "cardinality" : "multi",
            "type" : "string",
            "id" : "family_tag_label",
            "property" : []
         }
      ],
      "fields_hash" : {
         "annotation_extension_class" : {
            "transform" : [],
            "description" : "Column 16: extension class for the annotation.",
            "display_name" : "Annotation extension",
            "indexed" : "true",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "multi",
            "type" : "string",
            "id" : "annotation_extension_class",
            "property" : []
         },
         "source" : {
            "transform" : [],
            "description" : "Column 1: database source.",
            "display_name" : "Source",
            "indexed" : "true",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "single",
            "type" : "string",
            "id" : "source",
            "property" : []
         },
         "annotation_extension_class_closure_label" : {
            "transform" : [],
            "description" : "???",
            "display_name" : "Annotation extension",
            "indexed" : "true",
            "searchable" : "true",
            "required" : "false",
            "cardinality" : "multi",
            "type" : "string",
            "id" : "annotation_extension_class_closure_label",
            "property" : []
         },
         "bioentity_label" : {
            "transform" : [],
            "description" : "Column 3: bioentity label.",
            "display_name" : "Gene/product label",
            "indexed" : "true",
            "searchable" : "true",
            "required" : "false",
            "cardinality" : "single",
            "type" : "string",
            "id" : "bioentity_label",
            "property" : []
         },
         "taxon_closure_label" : {
            "transform" : [],
            "description" : "Labels derived from C13 + ncbi_taxonomy.obo.",
            "display_name" : "Taxon",
            "indexed" : "true",
            "searchable" : "true",
            "required" : "false",
            "cardinality" : "multi",
            "type" : "string",
            "id" : "taxon_closure_label",
            "property" : []
         },
         "date" : {
            "transform" : [],
            "description" : "Column 14: date of assignment.",
            "display_name" : "Date",
            "indexed" : "true",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "single",
            "type" : "string",
            "id" : "date",
            "property" : []
         },
         "qualifier" : {
            "transform" : [],
            "description" : "Derived from column 4.",
            "display_name" : "Qualifier",
            "indexed" : "true",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "multi",
            "type" : "string",
            "id" : "qualifier",
            "property" : []
         },
         "reference" : {
            "transform" : [],
            "description" : "Column 6: database reference.",
            "display_name" : "Reference",
            "indexed" : "true",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "single",
            "type" : "string",
            "id" : "reference",
            "property" : []
         },
         "bioentity_internal_id" : {
            "transform" : [],
            "description" : "The bioentity ID used at the database of origin.",
            "display_name" : "This should not be displayed",
            "indexed" : "false",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "single",
            "type" : "string",
            "id" : "bioentity_internal_id",
            "property" : []
         },
         "bioentity_name" : {
            "transform" : [],
            "description" : "The full name of the gene product.",
            "display_name" : "Gene/Product name",
            "indexed" : "true",
            "searchable" : "true",
            "required" : "false",
            "cardinality" : "single",
            "type" : "string",
            "id" : "bioentity_name",
            "property" : []
         },
         "evidence_type" : {
            "transform" : [],
            "description" : "Column 7: evidence type.",
            "display_name" : "Evidence",
            "indexed" : "true",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "single",
            "type" : "string",
            "id" : "evidence_type",
            "property" : []
         },
         "id" : {
            "transform" : [],
            "description" : "A unique (and internal) combination of bioentity and ontology class.",
            "display_name" : "Acc",
            "indexed" : "true",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "single",
            "type" : "string",
            "id" : "id",
            "property" : []
         },
         "taxon_closure" : {
            "transform" : [],
            "description" : "IDs derived from C13 + ncbi_taxonomy.obo.",
            "display_name" : "Taxon (IDs)",
            "indexed" : "true",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "multi",
            "type" : "string",
            "id" : "taxon_closure",
            "property" : []
         },
         "annotation_extension_class_label" : {
            "transform" : [],
            "description" : "???",
            "display_name" : "Annotation extension (labels)",
            "indexed" : "true",
            "searchable" : "true",
            "required" : "false",
            "cardinality" : "multi",
            "type" : "string",
            "id" : "annotation_extension_class_label",
            "property" : []
         },
         "bioentity_isoform" : {
            "transform" : [],
            "description" : "Column 17: Bioentity isoform.",
            "display_name" : "Isoform",
            "indexed" : "true",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "single",
            "type" : "string",
            "id" : "bioentity_isoform",
            "property" : []
         },
         "isa_partof_closure_label" : {
            "transform" : [],
            "description" : "Closure of labels over isa and partof.",
            "display_name" : "Involved in",
            "indexed" : "true",
            "searchable" : "true",
            "required" : "false",
            "cardinality" : "multi",
            "type" : "string",
            "id" : "isa_partof_closure_label",
            "property" : []
         },
         "family_tag" : {
            "transform" : [],
            "description" : "Family IDs that are associated with this entity.",
            "display_name" : "Protein family",
            "indexed" : "true",
            "searchable" : "true",
            "required" : "false",
            "cardinality" : "multi",
            "type" : "string",
            "id" : "family_tag",
            "property" : []
         },
         "aspect" : {
            "transform" : [],
            "description" : "Column 9: Ontology aspect.",
            "display_name" : "Ontology (aspect)",
            "indexed" : "true",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "single",
            "type" : "string",
            "id" : "aspect",
            "property" : []
         },
         "annotation_class" : {
            "transform" : [],
            "description" : "Column 5.",
            "display_name" : "Annotation class",
            "indexed" : "true",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "single",
            "type" : "string",
            "id" : "annotation_class",
            "property" : []
         },
         "taxon" : {
            "transform" : [],
            "description" : "Column 13: taxon.",
            "display_name" : "Taxon",
            "indexed" : "true",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "single",
            "type" : "string",
            "id" : "taxon",
            "property" : []
         },
         "regulates_closure_label" : {
            "transform" : [],
            "description" : "Closure of labels over regulates.",
            "display_name" : "Regulates + involved in",
            "indexed" : "true",
            "searchable" : "true",
            "required" : "false",
            "cardinality" : "multi",
            "type" : "string",
            "id" : "regulates_closure_label",
            "property" : []
         },
         "regulates_closure" : {
            "transform" : [],
            "description" : "Closure of ids/accs over regulates.",
            "display_name" : "Regulates + involved in (IDs)",
            "indexed" : "true",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "multi",
            "type" : "string",
            "id" : "regulates_closure",
            "property" : []
         },
         "isa_partof_closure" : {
            "transform" : [],
            "description" : "Closure of ids/accs over isa and partof.",
            "display_name" : "Involved in (IDs)",
            "indexed" : "true",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "multi",
            "type" : "string",
            "id" : "isa_partof_closure",
            "property" : []
         },
         "bioentity" : {
            "transform" : [],
            "description" : "Column 1 + columns 2.",
            "display_name" : "Gene/Product",
            "indexed" : "true",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "single",
            "type" : "string",
            "id" : "bioentity",
            "property" : []
         },
         "annotation_class_label" : {
            "transform" : [],
            "description" : "Column 5 + ontology.",
            "display_name" : "Annotation class label",
            "indexed" : "true",
            "searchable" : "true",
            "required" : "false",
            "cardinality" : "single",
            "type" : "string",
            "id" : "annotation_class_label",
            "property" : []
         },
         "taxon_label" : {
            "transform" : [],
            "description" : "Derived from C13 + ncbi_taxonomy.obo.",
            "display_name" : "Taxon",
            "indexed" : "true",
            "searchable" : "true",
            "required" : "false",
            "cardinality" : "single",
            "type" : "string",
            "id" : "taxon_label",
            "property" : []
         },
         "synonym" : {
            "transform" : [],
            "description" : "Column 11: gene product synonyms.",
            "display_name" : "Synonym",
            "indexed" : "true",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "multi",
            "type" : "string",
            "id" : "synonym",
            "property" : []
         },
         "evidence_type_closure" : {
            "transform" : [],
            "description" : "All evidence (evidence closure) for this annotation",
            "display_name" : "Evidence type (inferred)",
            "indexed" : "true",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "multi",
            "type" : "string",
            "id" : "evidence_type_closure",
            "property" : []
         },
         "family_tag_label" : {
            "transform" : [],
            "description" : "Families that are associated with this entity.",
            "display_name" : "Family",
            "indexed" : "true",
            "searchable" : "true",
            "required" : "false",
            "cardinality" : "multi",
            "type" : "string",
            "id" : "family_tag_label",
            "property" : []
         },
         "evidence_with" : {
            "transform" : [],
            "description" : "Column 8: with/from.",
            "display_name" : "Evidence with",
            "indexed" : "true",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "multi",
            "type" : "string",
            "id" : "evidence_with",
            "property" : []
         },
         "assigned_by" : {
            "transform" : [],
            "description" : "Column 15: assigned by.",
            "display_name" : "Assigned by",
            "indexed" : "true",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "single",
            "type" : "string",
            "id" : "assigned_by",
            "property" : []
         },
         "type" : {
            "transform" : [],
            "description" : "Column 12: type class id.",
            "display_name" : "Type class id",
            "indexed" : "true",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "single",
            "type" : "string",
            "id" : "type",
            "property" : []
         },
         "annotation_extension_class_closure" : {
            "transform" : [],
            "description" : "???",
            "display_name" : "Annotation extension (IDs)",
            "indexed" : "true",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "multi",
            "type" : "string",
            "id" : "annotation_extension_class_closure",
            "property" : []
         }
      },
      "document_category" : "annotation",
      "weight" : "20",
      "_strict" : 0,
      "id" : "bbop_ann",
      "_outfile" : "/home/sjcarbon/local/src/git/amigo/metadata//ann-config.yaml"
   },
   "bbop_ont" : {
      "searchable_extension" : "_searchable",
      "result_weights" : "annotation_class^8.0 description^6.0 source^4.0 synonym^3.0 alternate_id^2.0 comment^1.0",
      "filter_weights" : "source^4.0 subset^3.0 isa_partof_closure_label^2.0 regulates_closure_label^1.0 is_obsolete^0.0",
      "_infile" : "/home/sjcarbon/local/src/git/amigo/metadata//ont-config.yaml",
      "display_name" : "Ontology",
      "description" : "Test mapping of ontology class for GO.",
      "boost_weights" : "annotation_class^2.0 annotation_class_label^2.0 description^1.0 comment^0.5 synonym^1.0 alternate_id^1.0",
      "fields" : [
         {
            "transform" : [],
            "description" : "Term acc/ID.",
            "display_name" : "Acc",
            "indexed" : "true",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "single",
            "type" : "string",
            "id" : "id",
            "property" : [
               "getIdentifier"
            ]
         },
         {
            "transform" : [],
            "description" : "Term acc/ID.",
            "display_name" : "Term ID",
            "indexed" : "true",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "single",
            "type" : "string",
            "id" : "annotation_class",
            "property" : [
               "getIdentifier"
            ]
         },
         {
            "transform" : [],
            "description" : "Common term name.",
            "display_name" : "Term",
            "indexed" : "true",
            "searchable" : "true",
            "required" : "false",
            "cardinality" : "single",
            "type" : "string",
            "id" : "annotation_class_label",
            "property" : [
               "getLabel"
            ]
         },
         {
            "transform" : [],
            "description" : "Term definition.",
            "display_name" : "Definition",
            "indexed" : "true",
            "searchable" : "true",
            "required" : "false",
            "cardinality" : "single",
            "type" : "string",
            "id" : "description",
            "property" : [
               "getDef"
            ]
         },
         {
            "transform" : [],
            "description" : "Term namespace.",
            "display_name" : "Source",
            "indexed" : "true",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "single",
            "type" : "string",
            "id" : "source",
            "property" : [
               "getNamespace"
            ]
         },
         {
            "transform" : [],
            "description" : "Is the term obsolete?",
            "display_name" : "Obsoletion",
            "indexed" : "true",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "single",
            "type" : "boolean",
            "id" : "is_obsolete",
            "property" : [
               "getIsObsoleteBinaryString"
            ]
         },
         {
            "transform" : [],
            "description" : "Term comment.",
            "display_name" : "Comment",
            "indexed" : "true",
            "searchable" : "true",
            "required" : "false",
            "cardinality" : "single",
            "type" : "string",
            "id" : "comment",
            "property" : [
               "getComment"
            ]
         },
         {
            "transform" : [],
            "description" : "Term synonym.",
            "display_name" : "Synonym",
            "indexed" : "true",
            "searchable" : "true",
            "required" : "false",
            "cardinality" : "multi",
            "type" : "string",
            "id" : "synonym",
            "property" : [
               "getOBOSynonymStrings"
            ]
         },
         {
            "transform" : [],
            "description" : "Alternate term id.",
            "display_name" : "Alt ID",
            "indexed" : "true",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "multi",
            "type" : "string",
            "id" : "alternate_id",
            "property" : [
               "getAnnotationPropertyValues",
               "alt_id"
            ]
         },
         {
            "transform" : [],
            "description" : "Term that replaces this term.",
            "display_name" : "Replaced By",
            "indexed" : "true",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "multi",
            "type" : "string",
            "id" : "replaced_by",
            "property" : [
               "getAnnotationPropertyValues",
               "replaced_by"
            ]
         },
         {
            "transform" : [],
            "description" : "Others terms you might want to look at.",
            "display_name" : "Consider",
            "indexed" : "true",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "multi",
            "type" : "string",
            "id" : "consider",
            "property" : [
               "getAnnotationPropertyValues",
               "consider"
            ]
         },
         {
            "transform" : [],
            "description" : "Term subset.",
            "display_name" : "Subset",
            "indexed" : "true",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "multi",
            "type" : "string",
            "id" : "subset",
            "property" : [
               "getSubsets"
            ]
         },
         {
            "transform" : [],
            "description" : "Definition cross-reference.",
            "display_name" : "Def xref",
            "indexed" : "true",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "multi",
            "type" : "string",
            "id" : "definition_xref",
            "property" : [
               "getDefXref"
            ]
         },
         {
            "transform" : [],
            "description" : "Database cross-reference.",
            "display_name" : "DB xref",
            "indexed" : "true",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "multi",
            "type" : "string",
            "id" : "database_xref",
            "property" : [
               "getXref"
            ]
         },
         {
            "transform" : [],
            "description" : "Closure of ids/accs over isa and partof.",
            "display_name" : "Involved in (IDs)",
            "indexed" : "true",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "multi",
            "type" : "string",
            "id" : "isa_partof_closure",
            "property" : [
               "getRelationIDClosure",
               "BFO:0000050"
            ]
         },
         {
            "transform" : [],
            "description" : "Closure of labels over isa and partof.",
            "display_name" : "Involved in",
            "indexed" : "true",
            "searchable" : "true",
            "required" : "false",
            "cardinality" : "multi",
            "type" : "string",
            "id" : "isa_partof_closure_label",
            "property" : [
               "getRelationLabelClosure",
               "BFO:0000050"
            ]
         },
         {
            "transform" : [],
            "description" : "Closure of ids/accs over regulates.",
            "display_name" : "Regulates + involved in (IDs)",
            "indexed" : "true",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "multi",
            "type" : "string",
            "id" : "regulates_closure",
            "property" : [
               "getRelationIDClosure",
               "BFO:0000050",
               "RO:0002211",
               "RO:0002212",
               "RO:0002213"
            ]
         },
         {
            "transform" : [],
            "description" : "Closure of labels over regulates.",
            "display_name" : "Regulates + involved in",
            "indexed" : "true",
            "searchable" : "true",
            "required" : "false",
            "cardinality" : "multi",
            "type" : "string",
            "id" : "regulates_closure_label",
            "property" : [
               "getRelationLabelClosure",
               "BFO:0000050",
               "RO:0002211",
               "RO:0002212",
               "RO:0002213"
            ]
         },
         {
            "transform" : [],
            "description" : "JSON blob form of the local stepwise topology graph.",
            "display_name" : "This should not be displayed",
            "indexed" : "false",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "single",
            "type" : "string",
            "id" : "topology_graph",
            "property" : [
               "getSegmentShuntGraphJSON"
            ]
         },
         {
            "transform" : [],
            "description" : "JSON blob form of the local relation transitivity graph.",
            "display_name" : "This should not be displayed",
            "indexed" : "false",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "single",
            "type" : "string",
            "id" : "transitivity_graph",
            "property" : [
               "getLineageShuntGraphJSON"
            ]
         }
      ],
      "fields_hash" : {
         "source" : {
            "transform" : [],
            "description" : "Term namespace.",
            "display_name" : "Source",
            "indexed" : "true",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "single",
            "type" : "string",
            "id" : "source",
            "property" : [
               "getNamespace"
            ]
         },
         "definition_xref" : {
            "transform" : [],
            "description" : "Definition cross-reference.",
            "display_name" : "Def xref",
            "indexed" : "true",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "multi",
            "type" : "string",
            "id" : "definition_xref",
            "property" : [
               "getDefXref"
            ]
         },
         "database_xref" : {
            "transform" : [],
            "description" : "Database cross-reference.",
            "display_name" : "DB xref",
            "indexed" : "true",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "multi",
            "type" : "string",
            "id" : "database_xref",
            "property" : [
               "getXref"
            ]
         },
         "alternate_id" : {
            "transform" : [],
            "description" : "Alternate term id.",
            "display_name" : "Alt ID",
            "indexed" : "true",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "multi",
            "type" : "string",
            "id" : "alternate_id",
            "property" : [
               "getAnnotationPropertyValues",
               "alt_id"
            ]
         },
         "consider" : {
            "transform" : [],
            "description" : "Others terms you might want to look at.",
            "display_name" : "Consider",
            "indexed" : "true",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "multi",
            "type" : "string",
            "id" : "consider",
            "property" : [
               "getAnnotationPropertyValues",
               "consider"
            ]
         },
         "subset" : {
            "transform" : [],
            "description" : "Term subset.",
            "display_name" : "Subset",
            "indexed" : "true",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "multi",
            "type" : "string",
            "id" : "subset",
            "property" : [
               "getSubsets"
            ]
         },
         "topology_graph" : {
            "transform" : [],
            "description" : "JSON blob form of the local stepwise topology graph.",
            "display_name" : "This should not be displayed",
            "indexed" : "false",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "single",
            "type" : "string",
            "id" : "topology_graph",
            "property" : [
               "getSegmentShuntGraphJSON"
            ]
         },
         "id" : {
            "transform" : [],
            "description" : "Term acc/ID.",
            "display_name" : "Acc",
            "indexed" : "true",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "single",
            "type" : "string",
            "id" : "id",
            "property" : [
               "getIdentifier"
            ]
         },
         "is_obsolete" : {
            "transform" : [],
            "description" : "Is the term obsolete?",
            "display_name" : "Obsoletion",
            "indexed" : "true",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "single",
            "type" : "boolean",
            "id" : "is_obsolete",
            "property" : [
               "getIsObsoleteBinaryString"
            ]
         },
         "isa_partof_closure_label" : {
            "transform" : [],
            "description" : "Closure of labels over isa and partof.",
            "display_name" : "Involved in",
            "indexed" : "true",
            "searchable" : "true",
            "required" : "false",
            "cardinality" : "multi",
            "type" : "string",
            "id" : "isa_partof_closure_label",
            "property" : [
               "getRelationLabelClosure",
               "BFO:0000050"
            ]
         },
         "replaced_by" : {
            "transform" : [],
            "description" : "Term that replaces this term.",
            "display_name" : "Replaced By",
            "indexed" : "true",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "multi",
            "type" : "string",
            "id" : "replaced_by",
            "property" : [
               "getAnnotationPropertyValues",
               "replaced_by"
            ]
         },
         "annotation_class" : {
            "transform" : [],
            "description" : "Term acc/ID.",
            "display_name" : "Term ID",
            "indexed" : "true",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "single",
            "type" : "string",
            "id" : "annotation_class",
            "property" : [
               "getIdentifier"
            ]
         },
         "description" : {
            "transform" : [],
            "description" : "Term definition.",
            "display_name" : "Definition",
            "indexed" : "true",
            "searchable" : "true",
            "required" : "false",
            "cardinality" : "single",
            "type" : "string",
            "id" : "description",
            "property" : [
               "getDef"
            ]
         },
         "regulates_closure_label" : {
            "transform" : [],
            "description" : "Closure of labels over regulates.",
            "display_name" : "Regulates + involved in",
            "indexed" : "true",
            "searchable" : "true",
            "required" : "false",
            "cardinality" : "multi",
            "type" : "string",
            "id" : "regulates_closure_label",
            "property" : [
               "getRelationLabelClosure",
               "BFO:0000050",
               "RO:0002211",
               "RO:0002212",
               "RO:0002213"
            ]
         },
         "regulates_closure" : {
            "transform" : [],
            "description" : "Closure of ids/accs over regulates.",
            "display_name" : "Regulates + involved in (IDs)",
            "indexed" : "true",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "multi",
            "type" : "string",
            "id" : "regulates_closure",
            "property" : [
               "getRelationIDClosure",
               "BFO:0000050",
               "RO:0002211",
               "RO:0002212",
               "RO:0002213"
            ]
         },
         "transitivity_graph" : {
            "transform" : [],
            "description" : "JSON blob form of the local relation transitivity graph.",
            "display_name" : "This should not be displayed",
            "indexed" : "false",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "single",
            "type" : "string",
            "id" : "transitivity_graph",
            "property" : [
               "getLineageShuntGraphJSON"
            ]
         },
         "isa_partof_closure" : {
            "transform" : [],
            "description" : "Closure of ids/accs over isa and partof.",
            "display_name" : "Involved in (IDs)",
            "indexed" : "true",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "multi",
            "type" : "string",
            "id" : "isa_partof_closure",
            "property" : [
               "getRelationIDClosure",
               "BFO:0000050"
            ]
         },
         "synonym" : {
            "transform" : [],
            "description" : "Term synonym.",
            "display_name" : "Synonym",
            "indexed" : "true",
            "searchable" : "true",
            "required" : "false",
            "cardinality" : "multi",
            "type" : "string",
            "id" : "synonym",
            "property" : [
               "getOBOSynonymStrings"
            ]
         },
         "comment" : {
            "transform" : [],
            "description" : "Term comment.",
            "display_name" : "Comment",
            "indexed" : "true",
            "searchable" : "true",
            "required" : "false",
            "cardinality" : "single",
            "type" : "string",
            "id" : "comment",
            "property" : [
               "getComment"
            ]
         },
         "annotation_class_label" : {
            "transform" : [],
            "description" : "Common term name.",
            "display_name" : "Term",
            "indexed" : "true",
            "searchable" : "true",
            "required" : "false",
            "cardinality" : "single",
            "type" : "string",
            "id" : "annotation_class_label",
            "property" : [
               "getLabel"
            ]
         }
      },
      "document_category" : "ontology_class",
      "weight" : "40",
      "_strict" : 0,
      "id" : "bbop_ont",
      "_outfile" : "/home/sjcarbon/local/src/git/amigo/metadata//ont-config.yaml"
   }
};
