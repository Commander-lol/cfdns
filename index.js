const fs = require('fs-jetpack')
const request = require('request-promise-native')

const base = 'https://api.cloudflare.com/client/v4/'
const gurl = ep => `${ base }${ ep }`

async function getIp() {
	console.log(`[CFDNS] Fetching IP from https://api.ipify.org`)
	const res = await request('https://api.ipify.org?format=json')
	const { ip } = JSON.parse(res)
	return ip
}

async function getRecord(zone_id, domain, opts) {
	const params = new URLSearchParams()
	params.set('type', 'A')
	params.set('name', domain)

	const parts = await request(gurl(`zones/${ zone_id }/dns_records?${ params.toString() }`), opts)
	const json = JSON.parse(parts)
	return json.result[0]
}

async function setRecordIp(zone_id, record, ip, opts, ctx = {}) {
	const url = gurl(`zones/${ zone_id }/dns_records/${ record.id }`)
	const method = 'PUT'
	const json = {
		type: 'A',
		name: record.name,
		content: ip,
		proxied: true,
		...ctx,
	}

	return request(url, {
		method,
		json,
		...opts,
	})
}

async function createRecord(zone_id, domain, ip, opts, ctx = {}) {
	const url = gurl(`zones/${ zone_id }/dns_records`)
	const method = 'POST'
	const json = {
		type: 'A',
		name: domain,
		content: ip,
		proxied: true,
		...ctx,
	}

	return request(url, {
		method,
		json,
		...opts,
	})
}

async function main() {
	const config = await fs.readAsync('./config.json', 'json')
	const { zone_id, token, hosts } = config

	const requestOpts = {
		headers: {
			"Authorization": `Bearer ${ token }`,
		},
	}

	const ip = await getIp()

	console.log('[CFDNS] Using IP %s for all domains', ip)

	for (const entry of hosts) {
		const { name } = entry
		const record = await getRecord(zone_id, name, requestOpts)
		if (record) {
			if (record.content === ip) {
				console.log('[CFDNS] Skipping %s', name)
				continue
			}
			console.log('[CFDNS] Updating record for %s', name)
			await setRecordIp(zone_id, record, ip, requestOpts, entry)
		} else {
			console.log('[CFDNS] Creating new record for %s', name)
			await createRecord(zone_id, name, ip, requestOpts, entry)
		}
	}
}

main()