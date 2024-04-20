import * as geoip from 'geoip-lite';

export const location = (ip: string): any => {

    const location: geoip.Lookup | null = geoip.lookup(ip);

    if (location) { return location; }
    else { return false }

}