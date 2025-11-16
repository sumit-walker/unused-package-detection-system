class Reporter {
  generate(data) {
    const { 
      language,
      dependencies, 
      usedDependencies, 
      comparison, 
      vulnerabilities,
      outdated,
      storageImpact,
      projectPath
    } = data;

    const usedPackageNames = new Set(
      usedDependencies.map(dep => dep.name)
    );

    const unusedPackages = comparison.unused.filter(dep => 
      !usedPackageNames.has(dep.name)
    );

    return {
      language: language || 'nodejs',
      projectPath,
      summary: {
        totalDependencies: comparison.total,
        usedCount: usedDependencies.length,
        unusedCount: unusedPackages.length,
        missingCount: comparison.missing.length,
        vulnerabilityCount: vulnerabilities.length,
        outdatedCount: outdated?.length || 0
      },
      dependencies: {
        used: usedDependencies,
        unused: unusedPackages,
        missing: comparison.missing
      },
      security: {
        vulnerabilities: vulnerabilities,
        criticalCount: vulnerabilities.filter(v => v.severity === 'critical').length,
        highCount: vulnerabilities.filter(v => v.severity === 'high').length
      },
      outdated: outdated || [],
      impact: {
        storageSavedMB: storageImpact.estimatedSavingsMB,
        storageSavedGB: storageImpact.estimatedSavingsGB,
        packagesToRemove: storageImpact.packages
      },
      timestamp: new Date().toISOString()
    };
  }
}

export { Reporter };