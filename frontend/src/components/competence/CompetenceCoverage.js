import React, { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import './CompetenceCoverage.css';

/**
 * CompetenceCoverage component
 * Displays a radar chart showing competence and criteria coverage from learning situations
 */
const CompetenceCoverage = ({
  learningSituations = [],
  allCompetences = [],
  isExpanded = false,
  onToggleExpanded
}) => {
  const { t } = useTranslation(['subjects', 'common', 'modules']);
  const [coverageData, setCoverageData] = useState(null);

  // Calculate coverage data from learning situations
  const calculateCoverage = useMemo(() => {
    console.log('🔍 CompetenceCoverage - Calculating coverage...');
    console.log('📊 All competences for subject+year:', allCompetences);
    console.log('🎯 Learning situations:', learningSituations);

    if (!allCompetences.length) {
      console.log('❌ No competences available for this subject+year combination');
      return {
        competenceCoverage: [],
        stats: {
          totalCompetences: 0,
          fullyyCoveredCompetences: 0,
          partiallyCoveredCompetences: 0,
          uncoveredCompetences: 0,
          totalCriteria: 0,
          totalCoveredCriteria: 0,
          overallCoveragePercentage: 0
        }
      };
    }

    // Get all modules from all learning situations
    const allModules = learningSituations.reduce((modules, situation) => {
      console.log('🔍 Processing situation:', situation.title, 'Modules:', situation.modules);
      
      if (situation.modules && Array.isArray(situation.modules)) {
        // Handle both cases: modules as objects or as IDs
        const situationModules = situation.modules.filter(module => {
          if (typeof module === 'object' && module !== null) {
            return true; // Module is already an object
          } else {
            console.log('⚠️ Module is not an object (might be ID):', module);
            return false; // Skip IDs for now
          }
        });
        
        return [...modules, ...situationModules];
      }
      return modules;
    }, []);

    console.log('📦 All modules found:', allModules);

    // For each specific competence that should be covered (from allCompetences),
    // check if it's addressed by any module in the learning situations
    const competenceCoverage = allCompetences.map(competence => {
      const totalCriteria = competence.evaluation_criteria?.length || 0;
      console.log(`🎯 Analyzing required competence ${competence.code} with ${totalCriteria} criteria`);
      
      // Find which criteria are covered by modules
      const coveredCriteria = new Set();
      let isCompetenceAddressed = false;
      
      allModules.forEach(module => {
        console.log(`📦 Checking module "${module.title}"`);
        console.log('   - Module addresses competences:', module.specific_competences);
        console.log('   - Module selected criteria:', module.selected_criteria);

        // Check if this module addresses this specific competence
        const moduleAddressesThisCompetence = module.specific_competences?.includes(competence.id);
        
        if (moduleAddressesThisCompetence) {
          isCompetenceAddressed = true;
          console.log(`✅ Module "${module.title}" addresses competence ${competence.code}`);
          
          // If the module has selected criteria for this competence, count them
          if (module.selected_criteria && module.selected_criteria[competence.id]) {
            console.log('   - Selected criteria for this competence:', module.selected_criteria[competence.id]);
            
            module.selected_criteria[competence.id].forEach(criteriaId => {
              coveredCriteria.add(criteriaId);
              console.log(`   ✓ Added criterion: ${criteriaId}`);
            });
          } else {
            console.log('   ⚠️ Module addresses competence but no criteria selected');
          }
        } else {
          console.log(`❌ Module "${module.title}" does not address competence ${competence.code}`);
        }
      });

      const coveredCount = coveredCriteria.size;
      let coverageStatus;
      let coveragePercentage;

      if (!isCompetenceAddressed) {
        // Competence is not addressed by any module
        coverageStatus = 'not_covered';
        coveragePercentage = 0;
      } else if (totalCriteria === 0) {
        // Competence is addressed but has no criteria (edge case)
        coverageStatus = 'fully_covered';
        coveragePercentage = 100;
      } else if (coveredCount === 0) {
        // Competence is addressed but no criteria selected
        coverageStatus = 'not_covered';
        coveragePercentage = 0;
      } else if (coveredCount === totalCriteria) {
        // All criteria covered
        coverageStatus = 'fully_covered';
        coveragePercentage = 100;
      } else {
        // Some criteria covered
        coverageStatus = 'partially_covered';
        coveragePercentage = (coveredCount / totalCriteria) * 100;
      }

      console.log(`📊 Competence ${competence.code}: ${coverageStatus} - ${coveredCount}/${totalCriteria} criteria (${coveragePercentage.toFixed(1)}%)`);

      return {
        competence,
        totalCriteria,
        coveredCount,
        coveragePercentage,
        coverageStatus,
        isAddressed: isCompetenceAddressed,
        coveredCriteria: Array.from(coveredCriteria),
        missingCriteria: competence.evaluation_criteria?.filter(
          criterion => !coveredCriteria.has(criterion.id)
        ) || []
      };
    });

    // Calculate overall statistics
    const totalCompetences = allCompetences.length;
    const fullyyCoveredCompetences = competenceCoverage.filter(c => c.coverageStatus === 'fully_covered').length;
    const partiallyCoveredCompetences = competenceCoverage.filter(c => c.coverageStatus === 'partially_covered').length;
    const uncoveredCompetences = competenceCoverage.filter(c => c.coverageStatus === 'not_covered').length;

    const totalCriteria = competenceCoverage.reduce((sum, c) => sum + c.totalCriteria, 0);
    const totalCoveredCriteria = competenceCoverage.reduce((sum, c) => sum + c.coveredCount, 0);
    const overallCoveragePercentage = totalCriteria > 0 ? (totalCoveredCriteria / totalCriteria) * 100 : 0;

    console.log('📈 Final statistics:', {
      totalCompetences,
      fullyyCoveredCompetences,
      partiallyCoveredCompetences,
      uncoveredCompetences,
      totalCriteria,
      totalCoveredCriteria,
      overallCoveragePercentage
    });

    return {
      competenceCoverage,
      stats: {
        totalCompetences,
        fullyyCoveredCompetences,
        partiallyCoveredCompetences,
        uncoveredCompetences,
        totalCriteria,
        totalCoveredCriteria,
        overallCoveragePercentage
      }
    };
  }, [allCompetences, learningSituations]);

  useEffect(() => {
    setCoverageData(calculateCoverage);
  }, [calculateCoverage]);

  // Generate radar chart points
  const generateRadarPoints = () => {
    if (!coverageData) return [];

    const { competenceCoverage } = coverageData;
    const center = 175; // SVG center - increased for more padding
    const maxRadius = 120;
    const angleStep = (2 * Math.PI) / competenceCoverage.length;

    return competenceCoverage.map((coverage, index) => {
      const angle = index * angleStep - Math.PI / 2; // Start from top
      const radius = (coverage.coveragePercentage / 100) * maxRadius;
      
      return {
        x: center + radius * Math.cos(angle),
        y: center + radius * Math.sin(angle),
        labelX: center + (maxRadius + 40) * Math.cos(angle), // Increased label distance
        labelY: center + (maxRadius + 40) * Math.sin(angle),
        coverage,
        angle
      };
    });
  };

  // Generate grid circles
  const generateGridCircles = () => {
    const center = 175; // Updated to match radar points
    const maxRadius = 120;
    const circles = [];
    
    for (let i = 1; i <= 4; i++) {
      const radius = (i / 4) * maxRadius;
      circles.push({
        radius,
        percentage: (i / 4) * 100
      });
    }
    
    return circles;
  };

  const radarPoints = generateRadarPoints();
  const gridCircles = generateGridCircles();

  if (!coverageData || coverageData.stats.totalCompetences === 0) {
    return (
      <div className="competence-coverage">
        <div className="coverage-header">
          <h3>{t('subjects:competenceCoverage')}</h3>
          <p className="no-data">
            {coverageData?.stats.totalCompetences === 0 
              ? t('subjects:noCompetencesForSubject')
              : t('subjects:loadingCoverage')
            }
          </p>
        </div>
      </div>
    );
  }

  const { stats } = coverageData;

  return (
    <div className="competence-coverage">
      <div className="coverage-header">
        <h3>{t('subjects:competenceCoverage')}</h3>
        <button 
          className="expand-toggle"
          onClick={onToggleExpanded}
          title={isExpanded ? t('common:collapse') : t('common:expand')}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="16" 
            height="16" 
            fill="currentColor" 
            viewBox="0 0 16 16"
            className={isExpanded ? 'rotated' : ''}
          >
            <path fillRule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"/>
          </svg>
        </button>
      </div>

      <div className="coverage-summary">
        <div className="overall-progress">
          <div className="progress-circle-container">
            <div className="competences-percentage">
              <span style={{ color: '#38a169', fontSize: '14px', fontWeight: '600' }}>
                {Math.round((stats.fullyyCoveredCompetences / stats.totalCompetences) * 100)}% {t('subjects:competences')}
              </span>
            </div>
            <div className="progress-circle">
            <svg width="100" height="100" viewBox="0 0 100 100">
              {/* Outer ring background - Competences */}
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#e2e8f0"
                strokeWidth="6"
              />
              {/* Outer ring progress - Competences */}
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#38a169"
                strokeWidth="6"
                strokeDasharray={`${((stats.fullyyCoveredCompetences / stats.totalCompetences) * 100 / 100) * 251.3} 251.3`}
                strokeLinecap="round"
                transform="rotate(-90 50 50)"
              />
              
              {/* Inner ring background - Criteria */}
              <circle
                cx="50"
                cy="50"
                r="28"
                fill="none"
                stroke="#e2e8f0"
                strokeWidth="6"
              />
              {/* Inner ring progress - Criteria */}
              <circle
                cx="50"
                cy="50"
                r="28"
                fill="none"
                stroke="#4299e1"
                strokeWidth="6"
                strokeDasharray={`${(stats.overallCoveragePercentage / 100) * 175.9} 175.9`}
                strokeLinecap="round"
                transform="rotate(-90 50 50)"
              />
              
              {/* Center text - Only criteria */}
              <text
                x="50"
                y="47"
                textAnchor="middle"
                dominantBaseline="middle"
                className="progress-text"
                fontSize="14"
                fontWeight="600"
              >
                {Math.round(stats.overallCoveragePercentage)}%
              </text>
              <text
                x="50"
                y="58"
                textAnchor="middle"
                dominantBaseline="middle"
                className="progress-text"
                fontSize="9"
                fill="#718096"
              >
                {t('subjects:criteria')}
              </text>
            </svg>
          </div>
          </div>
          <div className="progress-details">
            <h4>{t('subjects:overallCoverage')}</h4>
            <p>{stats.fullyyCoveredCompetences} / {stats.totalCompetences} {t('subjects:competencesCovered')}</p>
            <p>{stats.totalCoveredCriteria} / {stats.totalCriteria} {t('subjects:criteriasCovered')}</p>
          </div>
        </div>

        <div className="competence-stats">
          <div className="stat-item fully-covered">
            <span className="stat-number">{stats.fullyyCoveredCompetences}</span>
            <span className="stat-label">{t('subjects:fullyCovered')}</span>
          </div>
          <div className="stat-item partially-covered">
            <span className="stat-number">{stats.partiallyCoveredCompetences}</span>
            <span className="stat-label">{t('subjects:partiallyCovered')}</span>
          </div>
          <div className="stat-item uncovered">
            <span className="stat-number">{stats.uncoveredCompetences}</span>
            <span className="stat-label">{t('subjects:uncovered')}</span>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="coverage-details">
          <div className="radar-chart-container">
            <svg width="350" height="350" viewBox="0 0 350 350" className="radar-chart">
              {/* Grid circles */}
              {gridCircles.map((circle, index) => (
                <circle
                  key={index}
                  cx="175"
                  cy="175"
                  r={circle.radius}
                  fill="none"
                  stroke="#e2e8f0"
                  strokeWidth="1"
                  opacity="0.5"
                />
              ))}

              {/* Grid lines */}
              {radarPoints.map((point, index) => (
                <line
                  key={index}
                  x1="175"
                  y1="175"
                  x2={point.labelX}
                  y2={point.labelY}
                  stroke="#e2e8f0"
                  strokeWidth="1"
                  opacity="0.3"
                />
              ))}

              {/* Coverage polygon */}
              {radarPoints.length > 0 && (
                <polygon
                  points={radarPoints.map(p => `${p.x},${p.y}`).join(' ')}
                  fill="rgba(66, 153, 225, 0.2)"
                  stroke="#4299e1"
                  strokeWidth="2"
                />
              )}

              {/* Coverage points */}
              {radarPoints.map((point, index) => (
                <circle
                  key={index}
                  cx={point.x}
                  cy={point.y}
                  r="4"
                  fill={
                    point.coverage.coverageStatus === 'fully_covered' ? "#38a169" :
                    point.coverage.coverageStatus === 'partially_covered' ? "#ed8936" : "#e53e3e"
                  }
                  stroke="white"
                  strokeWidth="2"
                />
              ))}

              {/* Labels */}
              {radarPoints.map((point, index) => (
                <text
                  key={index}
                  x={point.labelX}
                  y={point.labelY}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="competence-label"
                  fontSize="10"
                  fill="#4a5568"
                >
                  {point.coverage.competence.code}
                </text>
              ))}
            </svg>
          </div>

          <div className="competence-details-list">
            <h4>{t('subjects:competenceBreakdown')}</h4>
            <div className="competence-list">
              {coverageData.competenceCoverage.map((coverage, index) => (
                <CompetenceDetailItem
                  key={coverage.competence.id}
                  coverage={coverage}
                  index={index}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Individual competence detail item
 */
const CompetenceDetailItem = ({ coverage, index }) => {
  const { t } = useTranslation(['subjects', 'modules']);
  const [showCriteria, setShowCriteria] = useState(false);

  const getStatusColor = (status) => {
    switch (status) {
      case 'fully_covered': return '#38a169';
      case 'partially_covered': return '#ed8936';
      case 'not_covered': return '#e53e3e';
      default: return '#e53e3e';
    }
  };

  const getStatusText = (status, isAddressed) => {
    switch (status) {
      case 'fully_covered': return t('subjects:fullyCovered');
      case 'partially_covered': return t('subjects:partiallyCovered');
      case 'not_covered': 
        return isAddressed ? t('subjects:addressedButNoCriteria') : t('subjects:notAddressed');
      default: return t('subjects:notAddressed');
    }
  };

  return (
    <div className="competence-detail-item">
      <div 
        className="competence-summary"
        onClick={() => setShowCriteria(!showCriteria)}
      >
        <div className="competence-info">
          <span className="competence-code">{coverage.competence.code}</span>
          <span className="competence-description">{coverage.competence.description}</span>
        </div>
        <div className="competence-progress">
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ 
                width: `${coverage.coveragePercentage}%`,
                backgroundColor: getStatusColor(coverage.coverageStatus)
              }}
            />
          </div>
          <span className="progress-text">
            {coverage.coveredCount}/{coverage.totalCriteria}
          </span>
          <span 
            className="status-badge"
            style={{ backgroundColor: getStatusColor(coverage.coverageStatus) }}
          >
            {getStatusText(coverage.coverageStatus, coverage.isAddressed)}
          </span>
        </div>
        <svg 
          className={`expand-icon ${showCriteria ? 'rotated' : ''}`}
          width="16" 
          height="16" 
          viewBox="0 0 16 16"
        >
          <path fillRule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"/>
        </svg>
      </div>

      {showCriteria && (
        <div className="criteria-details">
          {coverage.competence.evaluation_criteria?.length > 0 ? (
            <>
              {coverage.coveredCriteria.length > 0 && (
                <div className="criteria-section covered">
                  <h5>{t('subjects:coveredCriteria')}</h5>
                  <ul>
                    {coverage.competence.evaluation_criteria
                      .filter(criterion => coverage.coveredCriteria.includes(criterion.id))
                      .map(criterion => (
                        <li key={criterion.id} className="criterion covered">
                          <span className="criterion-status">✓</span>
                          <span className="criterion-content">
                            {criterion.code && (
                              <span className="criterion-code">{criterion.code}: </span>
                            )}
                            {criterion.description}
                          </span>
                        </li>
                      ))}
                  </ul>
                </div>
              )}
              
              {coverage.missingCriteria.length > 0 && (
                <div className="criteria-section missing">
                  <h5>{t('subjects:missingCriteria')}</h5>
                  <ul>
                    {coverage.missingCriteria.map(criterion => (
                      <li key={criterion.id} className="criterion missing">
                        <span className="criterion-status">✗</span>
                        <span className="criterion-content">
                          {criterion.code && (
                            <span className="criterion-code">{criterion.code}: </span>
                          )}
                          {criterion.description}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          ) : (
            <p className="no-criteria">{t('modules:noCriteriaAvailable')}</p>
          )}
        </div>
      )}
    </div>
  );
};

CompetenceCoverage.propTypes = {
  learningSituations: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    modules: PropTypes.array
  })),
  allCompetences: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    code: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    evaluation_criteria: PropTypes.array
  })),
  isExpanded: PropTypes.bool,
  onToggleExpanded: PropTypes.func.isRequired
};

CompetenceDetailItem.propTypes = {
  coverage: PropTypes.shape({
    competence: PropTypes.object.isRequired,
    coveragePercentage: PropTypes.number.isRequired,
    coveredCount: PropTypes.number.isRequired,
    totalCriteria: PropTypes.number.isRequired,
    coveredCriteria: PropTypes.array.isRequired,
    missingCriteria: PropTypes.array.isRequired
  }).isRequired,
  index: PropTypes.number.isRequired
};

export default CompetenceCoverage; 