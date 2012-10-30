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
amigo.data.statistics.annotation_source = [["MGI", 141633], ["UniProtKB", 95782], ["ZFIN", 86095], ["PomBase", 31869], ["RGD", 23206], ["dictyBase", 20566], ["GOC", 6231], ["BHF-UCL", 4526], ["RefGenome", 2740], ["IntAct", 790], ["HGNC", 486], ["DFLAT", 304], ["PINC", 17], ["Roslin_Institute", 10], ["ENSEMBL", 2], ["Reactome", 1]];

/*
 * Variable: annotation_source
 * 
 * TBD
 */
amigo.data.statistics.annotation_evidence = [["similarity evidence", 103360], ["experimental evidence", 100456], ["curator inference", 54530]];

/*
 * Variable: annotation_overview
 * 
 * TBD
 */
amigo.data.statistics.annotation_overview = [["Source", "similarity evidence", "experimental evidence", "curator inference", "author statement", "combinatorial evidence", "genomic context evidence", "biological system reconstruction", "imported information"], ["MGI", 52439, 53862, 33194, 0, 0, 0, 0, 0], ["ZFIN", 0, 10201, 11115, 0, 0, 0, 0, 0], ["PomBase", 10121, 14791, 3570, 2665, 0, 0, 0, 0], ["dictyBase", 9293, 4312, 6478, 483, 0, 0, 0, 0]];
