define([
        '../ThirdParty/when',
        './Check',
        './defined',
        './defaultValue',
        './FeatureDetection',
        './Resource'
    ], function(
        when,
        Check,
        defined,
        defaultValue,
        FeatureDetection,
        Resource) {
    'use strict';

    /**
     * @private
     */
    function loadImageFromTypedArray(options) {
        var uint8Array = options.uint8Array;
        var format = options.format;
        var request = options.request;
        var flipY = defaultValue(options.flipY, false);
        //>>includeStart('debug', pragmas.debug);
        Check.typeOf.object('uint8Array', uint8Array);
        Check.typeOf.string('format', format);
        //>>includeEnd('debug');

        var blob = new Blob([uint8Array], {
            type : format
        });

        return Resource.supportsImageBitmapOptions()
            .then(function(result) {
                if (result) {
                    return when(Resource.createImageBitmapFromBlob(blob, flipY));
                }

                var blobUrl = window.URL.createObjectURL(blob);
                var resource = new Resource({
                    url: blobUrl,
                    request: request
                });

                return resource.fetchImage({
                    flipY : flipY
                })
                .then(function(image) {
                    window.URL.revokeObjectURL(blobUrl);
                    return image;
                })
                .otherwise(function(error) {
                    window.URL.revokeObjectURL(blobUrl);
                    return when.reject(error);
                });
            });
    }

    return loadImageFromTypedArray;
});
