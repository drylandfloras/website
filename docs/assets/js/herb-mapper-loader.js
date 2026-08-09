/* DRYLANDFLORAS_MAPPER_OPEN_ALIAS_V10 */
(function () {
  function selectedFile() {
    const input = document.getElementById('spreadsheet-file');
    return input && input.files && input.files[0] ? input.files[0] : null;
  }

  function isPreview(value) {
    return value && typeof value === 'object' && !(value instanceof File) && (
      Array.isArray(value.source_columns) ||
      Array.isArray(value.sourceColumns) ||
      Array.isArray(value.columns) ||
      Array.isArray(value.headers) ||
      value.mapping ||
      value.suggested_mapping ||
      value.detected_standard === false
    );
  }

  function installMapperOpenAlias() {
    const integration = window.DrylandFlorasConverterIntegration || window.DrylandFlorasConverter;
    if (!integration || typeof integration !== 'object') {
      window.DrylandFlorasMapperCompatReady = false;
      return false;
    }

    window.DrylandFlorasConverterIntegration = integration;
    window.DrylandFlorasConverter = Object.assign(window.DrylandFlorasConverter || {}, integration);

    if (typeof integration.open !== 'function') {
      integration.open = async function (previewOrFile, maybeFile) {
        const preview = isPreview(previewOrFile) ? previewOrFile : null;
        const file = maybeFile instanceof File
          ? maybeFile
          : (previewOrFile instanceof File ? previewOrFile : selectedFile());

        if (typeof integration.openFromPreview === 'function' && preview) {
          return await integration.openFromPreview(preview);
        }
        if (typeof integration.openAfterValidationFailure === 'function') {
          return await integration.openAfterValidationFailure(preview || file);
        }
        if (typeof integration.showFromFile === 'function') {
          return await integration.showFromFile(file, preview);
        }
        if (typeof integration.openMapper === 'function') {
          return await integration.openMapper(file, preview);
        }
        throw new Error('Nenhum método de abertura do mapeador está disponível.');
      };
    }

    if (typeof integration.openAfterValidationFailure !== 'function') {
      integration.openAfterValidationFailure = function (previewOrFile) {
        return integration.open(previewOrFile, selectedFile());
      };
    }

    if (typeof window.DrylandFlorasConverter.showFromFile !== 'function') {
      window.DrylandFlorasConverter.showFromFile = function (file, preview) {
        return integration.open(preview || file, file);
      };
    }
    if (typeof window.DrylandFlorasConverter.openAfterValidationFailure !== 'function') {
      window.DrylandFlorasConverter.openAfterValidationFailure = function (previewOrFile) {
        return integration.openAfterValidationFailure(previewOrFile);
      };
    }

    window.DrylandFlorasMapperCompatReady = typeof integration.open === 'function';
    console.info('[DrylandFloras] Mapper compat v10:', {
      integration: typeof window.DrylandFlorasConverterIntegration,
      open: typeof window.DrylandFlorasConverterIntegration.open,
      openAfterValidationFailure: typeof window.DrylandFlorasConverterIntegration.openAfterValidationFailure,
      showFromFile: typeof window.DrylandFlorasConverter.showFromFile
    });
    return window.DrylandFlorasMapperCompatReady;
  }

  installMapperOpenAlias();
  document.addEventListener('DOMContentLoaded', installMapperOpenAlias);
  window.addEventListener('load', installMapperOpenAlias);
  window.DrylandFlorasInstallMapperOpenAlias = installMapperOpenAlias;
})();
