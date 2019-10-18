# CFDNS

Dynamic server DNS backed by cloudflare

## Why?

If you run a server without a static IP address (e.g. at home), it can be
cumbersome or expensive to keep a domain name updated with the latest IP
that has been assigned to you.

Compatible with a free Cloudflare account, this script can keep you updated
and online

## How?

This will be written from the perspective of someone running a server in their
house with a residential intenret connection backed by a provider such as Virgin
media.

1. In your DHCP settings, assign a static IP address to the machine that should 
serve requests
2. With UPnP, port forward the relevant ports for access. This may be `80` and 
`22` for standard HTTP and SSH access
3. `git clone` this script to a target directory
4. `npm install` the dependencies
5. `cp config.example.json config.json` and fill in the relevant details. 
    1. The `zone_id` can be found by going to the cloudflare dashboard and looking
    at the overview for a given domain. On the right hand side are a series of 
    settings - see `1`
    2. Create an API token for the application. The link to do so (`2`) is located
    just underneath the Zone ID. The token only needs `edit` permissions on the 
    `Zone DNS` 
6. Set up a cron (or other scheduling option) to invoke the script at regular intervals
