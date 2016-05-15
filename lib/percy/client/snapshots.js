var Snapshots = module.exports = {
    create_snapshot: function (build_id, resources, options = {}) {
        // if !resources.respond_to?(:each)
        //     raise ArgumentError.new(
        //         'resources argument must be an iterable of Percy::Client::Resource objects')
        // end

        // widths = options[:widths] || config.default_widths
        // data = {
        //     'data' => {
        //         'type' => 'snapshots',
        //         'attributes' => {
        //             'name' => options[:name],
        //             'enable-javascript' => options[:enable_javascript],
        //             'widths' => widths,
        //         },
        //         'relationships' => {
        //             'resources' => {
        //                 'data' => resources.map { |r| r.serialize },
        //             },
        //         },
        //     },
        // }
        // post("#{config.api_url}/builds/#{build_id}/snapshots/", data)
    },

    finalize_snapshot: function (snapshot_id) {
        post("#{config.api_url}/snapshots/#{snapshot_id}/finalize", {})
    }
};
