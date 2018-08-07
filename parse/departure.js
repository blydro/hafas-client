// todo: what is d.jny.dirFlg?
// todo: d.stbStop.dProgType
// todo: d.freq, d.freq.jnyL, see https://github.com/public-transport/hafas-client/blob/9203ed1481f08baacca41ac5e3c19bf022f01b0b/parse.js#L115

const createParseDeparture = (profile, stations, lines, remarks) => {
	const findRemark = rm => remarks[parseInt(rm.remX)] || null

	const parseDeparture = (d) => {
		const when = profile.parseDateTime(profile, d.date, d.stbStop.dTimeR || d.stbStop.dTimeS)
		const res = {
			journeyId: d.jid,
			station: stations[parseInt(d.stbStop.locX)] || null,
                        nextStation: stations[d.stopL.length > 1 ? parseInt(d.stopL[1].locX) : 0] || null,
			when: when.toISO(),
			direction: profile.parseStationName(d.dirTxt),
			line: lines[parseInt(d.prodX)] || null,
			remarks: d.remL ? d.remL.map(findRemark) : [],
			trip: +d.jid.split('|')[1] // todo: this seems brittle
		}
		// todo: res.trip from rawLine.prodCtx.num?

		// todo: DRY with parseStopover
		// todo: DRY with parseJourneyLeg
		if (d.stbStop.dTimeR && d.stbStop.dTimeS) {
			const realtime = profile.parseDateTime(profile, d.date, d.stbStop.dTimeR)
			const planned = profile.parseDateTime(profile, d.date, d.stbStop.dTimeS)
			res.delay = Math.round((realtime - planned) / 1000)
		} else res.delay = null

		// todo: DRY with parseStopover
		// todo: DRY with parseJourneyLeg
		res.platform = d.stbStop.dPlatfR || d.stbStop.dPlatfS || null
		// todo: `formerScheduledPlatform`

		// todo: DRY with parseStopover
		// todo: DRY with parseJourneyLeg
		if (d.stbStop.aCncl || d.stbStop.dCncl) {
			res.cancelled = true
			Object.defineProperty(res, 'canceled', {value: true})
			res.when = res.delay = null

			const when = profile.parseDateTime(profile, d.date, d.stbStop.dTimeS)
			res.formerScheduledWhen = when.toISO()
		}

		return res
	}

	return parseDeparture
}

module.exports = createParseDeparture
