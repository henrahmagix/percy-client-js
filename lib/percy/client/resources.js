// require 'base64'
// require 'digest'
// require 'uri'

// MOCK
var Digest = {
    SHA256: {
        // TODO: fix or replace with Digest node
        hexdigest: function (content) {return content}
    }
};

class ArgumentError extends Error {
    get name() {
        return this._name || (this._name = 'ArgumentError');
    }
};

// A simple data container object used to pass data to create_snapshot.
class Resource {
    // attr_accessor :sha
    // attr_accessor :resource_url
    // attr_accessor :is_root
    // attr_accessor :mimetype
    // attr_accessor :content
    // attr_accessor :path

    constructor(resource_url, options = {}) {
        this.resource_url = resource_url

        if (!options.sha && !options.content) {
            throw new ArgumentError('Either "sha" or "content" must be given.');
        }
        this.sha = options.sha || Digest.SHA256.hexdigest(options.content)
        this.content = options.content

        this.is_root = options.is_root
        this.mimetype = options.mimetype

        // For optional convenience of temporarily storing the local content and path with this
        // object. These are never included when serialized.
        this.content = options.content
        this.path = options.path
    }

    serialize() {
        return {
            'type': 'resources',
            'id': this.sha,
            'attributes': {
                // 'resource-url': URI.escape(resource_url),
                // TODO: maybe doesn't need escaping
                'resource-url': this.resource_url,
                'mimetype': this.mimetype,
                'is-root': this.is_root,
            }
        };
    }

    inspect() {
        var content_msg = this.content === null ? '' : `this.content.length: ${this.content.length}`;
        return `<Resource ${sha} ${resource_url} is_root:${!!is_root} ${mimetype} ${content_msg}>`;
    }

    toString() {
        return this.inspect();
    }
};

module.exports = {

    Resource: Resource,

    Resources: {
        // def upload_resource(build_id, content)
        //     sha = Digest::SHA256.hexdigest(content)
        //     data = {
        //         'data' => {
        //             'type' => 'resources',
        //             'attributes' => {
        //                 'id' => sha,
        //                 'base64-content' => Base64.strict_encode64(content),
        //             },
        //         },
        //     }
        //     begin
        //         post("${config.api_url}/builds/${build_id}/resources/", data)
        //     rescue Percy::Client::ConflictError => e
        //         raise e if e.status != 409
        //         STDERR.puts "[percy] Warning: unnecessary resource reuploaded with SHA-256: ${sha}"
        //     end
        //     true
        // end
    }

};
