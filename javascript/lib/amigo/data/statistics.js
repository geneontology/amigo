/*
 * Package: statistics.js
 * 
 * Namespace: amigo.data.statistics
 * 
 * This package was automatically created during an AmiGO 2 installation.
 * 
 * Purpose: Useful numbers about the current data in the store.
 * 
 * Requirements: amigo.js for bbop.amigo namespace.
 * 
 * NOTE: This file is generated dynamically at installation time.
 *       Hard to work with unit tests--hope it's not too bad.
 *       Want to keep this real simple.
 */

// Module and namespace checking.
bbop.core.require('bbop', 'core');
bbop.core.namespace('amigo', 'data', 'statistics');

/*
 * Variable: annotation_evidence
 * 
 * TBD
 */
amigo.data.statistics.annotation_source = [["PomBase", 31878], ["MGI", 23265], ["dictyBase", 20566], ["UniProtKB", 15978], ["RGD", 3467], ["GOC", 1293], ["BHF-UCL", 635], ["RefGenome", 512], ["IntAct", 127], ["HGNC", 87], ["DFLAT", 11], ["PINC", 4], ["Reactome", 1]];

/*
 * Variable: annotation_source
 * 
 * TBD
 */
amigo.data.statistics.annotation_evidence = [["similarity evidence", 32265], ["experimental evidence", 29019], ["curator inference", 17805], ["author statement", 3709], ["combinatorial evidence", 761]];

/*
 * Variable: annotation_overview
 * 
 * TBD
 */
amigo.data.statistics.annotation_overview = [["Source", "similarity evidence", "experimental evidence", "curator inference", "author statement", "combinatorial evidence", "genomic context evidence", "biological system reconstruction", "imported information"], ["dictyBase", 9293, 4312, 6478, 483, 0, 0, 0, 0], ["EcoCyc", 0, 0, 0, 0, 0, 0, 0, 0], ["FlyBase", 0, 0, 0, 0, 0, 0, 0, 0], ["MGI", 8125, 7084, 7728, 290, 38, 0, 0, 0], ["PomBase", 10122, 14796, 3571, 2667, 722, 0, 0, 0], ["RGD", 3467, 0, 0, 0, 0, 0, 0, 0], ["SGD", 0, 0, 0, 0, 0, 0, 0, 0], ["TAIR", 0, 0, 0, 0, 0, 0, 0, 0], ["WB", 0, 0, 0, 0, 0, 0, 0, 0], ["ZFIN", 0, 0, 0, 0, 0, 0, 0, 0]];
