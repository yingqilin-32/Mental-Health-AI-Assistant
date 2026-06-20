export const tooltipFormatter = (params) => {
    const date = params[0].axisValue;
    let result = `<b>${date}</b><br/>`
    params.forEach(p => {
        result += `${p.marker}${p.seriesName}: <b>${p.value}</b><br/>`
    })
    return result;
}

