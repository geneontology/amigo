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
amigo.data.statistics.annotation_source = [["PomBase", 31869], ["GOC", 638], ["RefGenome", 201], ["UniProtKB", 60], ["BHF-UCL", 14], ["IntAct", 8], ["Reactome", 1]];

/*
 * Variable: annotation_source
 * 
 * TBD
 */
amigo.data.statistics.annotation_evidence = [["experimental evidence", 14955], ["similarity evidence", 10799], ["curator inference", 3579], ["author statement", 2736], ["combinatorial evidence", 722]];

/*
 * Variable: annotation_overview
 * 
 * TBD
 */
amigo.data.statistics.annotation_overview = [["Source", "similarity evidence", "experimental evidence", "curator inference", "author statement", "combinatorial evidence", "genomic context evidence", "biological system reconstruction", "imported information"], ["dictyBase", 0, 0, 0, 0, 0, 0, 0, 0], ["EcoCyc", 0, 0, 0, 0, 0, 0, 0, 0], ["FlyBase", 0, 0, 0, 0, 0, 0, 0, 0], ["MGI", 0, 0, 0, 0, 0, 0, 0, 0], ["PomBase", 10121, 14791, 3570, 2665, 722, 0, 0, 0], ["RGD", 0, 0, 0, 0, 0, 0, 0, 0], ["SGD", 0, 0, 0, 0, 0, 0, 0, 0], ["TAIR", 0, 0, 0, 0, 0, 0, 0, 0], ["WB", 0, 0, 0, 0, 0, 0, 0, 0], ["ZFIN", 0, 0, 0, 0, 0, 0, 0, 0]];
