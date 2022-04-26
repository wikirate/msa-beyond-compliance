// @ts-ignore
import pieChart from '../../assets/charts/pie.json';
// @ts-ignore
import customPieChart from '../../assets/charts/custom-pie.json';
// @ts-ignore
import pieGroupsChart from '../../assets/charts/pie-groups.json';
// @ts-ignore
import barChart from '../../assets/charts/bars.json';
// @ts-ignore
import groupedBarsChart from '../../assets/charts/subgroup-bars.json';
import {Injectable} from "@angular/core";
import embed from "vega-embed";

@Injectable()
export class ChartsService {
  wikirateApiHost = "https://wikirate.org"

  drawPieChart(title: string,
               element: string,
               values: {}[],
               width: number,
               height: number,
               colors: string[],
               domain: string[],
               options: {}) {
    var pie = JSON.parse(JSON.stringify(pieChart))
    let transform = pie["data"][0]["transform"]
    pie["description"] = title
    pie["data"][0]["values"] = values
    pie["width"] = width
    pie["height"] = height
    pie["scales"][0]["range"] = colors
    pie["scales"][0]["domain"] = domain
    return embed(element, pie, options)
  }

  drawPieCustomChart(title: string,
                     element: string,
                     assessed_statements_metric_id: number[],
                     metric: number,
                     year:number | string,
                     width: number,
                     height: number,
                     colors: string[],
                     domain: string[],
                     options: {}) {
    let pie = JSON.parse(JSON.stringify(customPieChart))
    let data = pie["data"]

    data.unshift({
      "name": "answers",
      "url": `${this.wikirateApiHost}/~${metric}+answer/answer_list.json?limit=0&filter[year]=${year}`,
      "transform": [{
        "type": "lookup",
        "from": "assessed",
        "key": "company",
        "fields": ["company"],
        "values": ["value"],
        "as": ["assessed"]
      },
        {
          "type":"filter",
          "expr":"datum.assessed === 'Yes'"
        },
        {
          "type":"formula",
          "as":"value",
          "expr": "test(/beyond tier 1/, datum.value)? 'beyond tier 1': 'direct'"
        }]
    })
    data.unshift({
      "name": "assessed",
      "url": `${this.wikirateApiHost}/~${assessed_statements_metric_id[1]}+Answer.json?view=answer_list&limit=0&filter[year]=${year}`,
      "transform": [
        {
          "type": "lookup",
          "from": "uk_assessed",
          "key": "company",
          "fields": ["company"],
          "values": ["value"],
          "as": ["uk_assessed"]
        },
        {
          "type": "formula",
          "as": "value",
          "expr": "datum.value == 'Yes' || datum.uk_assessed == 'Yes' ? 'Yes' : 'No'"
        }
      ]
    })
    data.unshift({
      name: 'uk_assessed',
      url: `${this.wikirateApiHost}/~${assessed_statements_metric_id[0]}+Answer.json?view=answer_list&limit=0&filter[year]=${year}`
    })
    pie["data"] = data
    pie["description"] = title
    pie["width"] = width
    pie["height"] = height
    pie["scales"][0]["range"] = colors
    pie["scales"][0]["domain"] = domain
    console.log(pie)
    return embed(element, pie, options)
  }

  drawMinimumRequirementsBarChart(
    title: string,
    element: string,
    width: number,
    height: number,
    assessed_statements_metric_id: number,
    metrics: [],
    year: number | string,
    options: {}) {
    let bars = JSON.parse(JSON.stringify(barChart))
    let data: any[] = []
    data.push({
      name: 'assessed',
      url: `${this.wikirateApiHost}/~${assessed_statements_metric_id}+Answer.json?view=answer_list&limit=0&filter[year]=${year}`
    })
    let short_labels: any[] = []
    for (let metric of metrics) {
      short_labels.push(metric['short_label'])
      let str_array = '['
      // @ts-ignore
      for (let value of metric['filter_value']) {
        str_array += '\'' + value + '\','
      }
      str_array = str_array.substring(0, str_array.length - 1) + ']'
      data.push({
        name: metric['short_label'],
        "url": `${this.wikirateApiHost}/~${metric['id']}+answer/answer_list.json?limit=0&filter[year]=${year}`,
        "transform": [
          {
            "type": "lookup",
            "from": "assessed",
            "key": "company",
            "fields": ["company"],
            "values": ["value"],
            "as": ["assessed"]
          },
          {
            "type": "filter",
            "expr": "datum.assessed == 'Yes'"
          },
          {
            "type": "formula",
            "as": "accepted_value",
            "expr": "indexof(" + str_array + ", datum.value) >= 0"
          },
          {"type": "aggregate", "groupby": ["accepted_value"]},
          {
            "type": "impute",
            "key": "accepted_value",
            "keyvals": [true],
            "field": "count",
            "value": 0
          },
          {"type": "joinaggregate", "fields": ["count"], "ops": ["sum"]},
          {"type": "filter", "expr": "datum.accepted_value == true"}
        ]
      })
    }
    data.push({'name': 'metrics', 'values': metrics})
    data.push({
      "name": "counts",
      "source": short_labels,
      "transform": [
        {
          "type": "window",
          "ops": [
            "row_number"
          ],
          "as": [
            "seq"
          ]
        },
        {
          "type": "lookup",
          "from": "metrics",
          "key": "seq",
          "fields": [
            "seq"
          ],
          "values": [
            "label",
            "metric",
            "color",
            "filter_value"
          ],
          "as": [
            "title",
            "wikirate_page",
            "color",
            "filter_value"
          ]
        },
        {
          "type": "formula",
          "expr": "datum.count/datum.sum_count",
          "as": "percentage"
        },
        {
          "type": "formula",
          "expr": "format(datum.count / datum.sum_count, '.0%')",
          "as": "percent_label"
        },
        {
          "type": "formula",
          "expr": "datum.count + ' out of ' + datum.sum_count + ' companies'",
          "as": "count_label"
        },
        {
          "type": "formula",
          "expr": "{ value: datum.filter_value }",
          "as": "filter"
        }
      ]
    })

    bars['description'] = title;
    bars['data'] = data
    bars['width'] = width
    bars['height'] = height
    embed(element, bars, options)
  }

  drawSubgroupsBarChart(
    title: string,
    element: string,
    width: number,
    height: number,
    assessed_statements_metric_id: number[],
    metric: number,
    subgroups: any,
    groups: any,
    year: number | string,
    options: {}) {
    let bars = JSON.parse(JSON.stringify(groupedBarsChart))
    let data: any[] = []
    data.push({
      name: 'uk_assessed',
      url: `${this.wikirateApiHost}/~${assessed_statements_metric_id[0]}+Answer.json?view=answer_list&limit=0&filter[year]=${year}`
    })
    data.push({
      "name": "assessed",
      "url": `${this.wikirateApiHost}/~${assessed_statements_metric_id[1]}+Answer.json?view=answer_list&limit=0&filter[year]=${year}`,
      "transform": [
        {
          "type": "lookup",
          "from": "uk_assessed",
          "key": "company",
          "fields": ["company"],
          "values": ["value"],
          "as": ["uk_assessed"]
        },
        {
          "type": "formula",
          "as": "value",
          "expr": "datum.value == 'Yes' || datum.uk_assessed == 'Yes' ? 'Yes' : 'No'"
        }
      ]
    })
    data.push({
      "name": "answers",
      "url": `${this.wikirateApiHost}/~${metric}+Answer.json?view=answer_list&limit=0&filter[year]=${year}`,
      "transform": [
        {
          "type": "lookup",
          "from": "assessed",
          "key": "company",
          "fields": ["company"],
          "values": ["value"],
          "as": ["assessed"]
        },
        {
          "type": "filter",
          "expr": "datum.value != '' && datum.assessed == 'Yes'"
        },
        {
          "type": "formula",
          "expr": "split(datum.value, ', ')",
          "as": "value_array"
        }
      ]
    })
    data.push(subgroups)
    data.push(groups)
    data.push(bars['data'][4])

    bars['description'] = title;
    bars['data'] = data
    bars['width'] = width
    bars['height'] = height
    return embed(element, bars, options)
  }

  drawBarChart(
    title: string,
    element: string,
    width: number,
    height: number,
    assessed_statements_metric_id: number[],
    metrics: [],
    year: number | string,
    options: {}) {
    let bars = JSON.parse(JSON.stringify(barChart))
    let data: any[] = []
    data.push({
      name: 'uk_assessed',
      url: `${this.wikirateApiHost}/~${assessed_statements_metric_id[0]}+Answer.json?view=answer_list&limit=0&filter[year]=${year}`
    })
    data.push({
      "name": "assessed",
      "url": `${this.wikirateApiHost}/~${assessed_statements_metric_id[1]}+Answer.json?view=answer_list&limit=0&filter[year]=${year}`,
      "transform": [
        {
          "type": "lookup",
          "from": "uk_assessed",
          "key": "company",
          "fields": ["company"],
          "values": ["value"],
          "as": ["uk_assessed"]
        },
        {
          "type": "formula",
          "as": "value",
          "expr": "datum.value == 'Yes' || datum.uk_assessed == 'Yes' ? 'Yes' : 'No'"
        }
      ]
    })
    let short_labels: any[] = []
    for (let metric of metrics) {
      short_labels.push(metric['short_label'])
      let str_array = '['
      // @ts-ignore
      for (let value of metric['filter_value']) {
        str_array += '\'' + value + '\','
      }
      str_array = str_array.substring(0, str_array.length - 1) + ']'
      data.push({
        name: metric['short_label'],
        "url": `${this.wikirateApiHost}/~${metric['id']}+answer/answer_list.json?limit=0&filter[year]=${year}`,
        "transform": [
          {
            "type": "lookup",
            "from": "assessed",
            "key": "company",
            "fields": ["company"],
            "values": ["value"],
            "as": ["assessed"]
          },
          {
            "type": "filter",
            "expr": "datum.assessed == 'Yes'"
          },
          {
            "type": "formula",
            "as": "accepted_value",
            "expr": "indexof(" + str_array + ", datum.value) >= 0"
          },
          {"type": "aggregate", "groupby": ["accepted_value"]},
          {
            "type": "impute",
            "key": "accepted_value",
            "keyvals": [true],
            "field": "count",
            "value": 0
          },
          {"type": "joinaggregate", "fields": ["count"], "ops": ["sum"]},
          {"type": "filter", "expr": "datum.accepted_value == true"}
        ]
      })
    }
    data.push({'name': 'metrics', 'values': metrics})
    data.push({
      "name": "counts",
      "source": short_labels,
      "transform": [
        {
          "type": "window",
          "ops": [
            "row_number"
          ],
          "as": [
            "seq"
          ]
        },
        {
          "type": "lookup",
          "from": "metrics",
          "key": "seq",
          "fields": [
            "seq"
          ],
          "values": [
            "label",
            "metric",
            "color",
            "filter_value"
          ],
          "as": [
            "title",
            "wikirate_page",
            "color",
            "filter_value"
          ]
        },
        {
          "type": "formula",
          "expr": "datum.count/datum.sum_count",
          "as": "percentage"
        },
        {
          "type": "formula",
          "expr": "format(datum.count / datum.sum_count, '.0%')",
          "as": "percent_label"
        },
        {
          "type": "formula",
          "expr": "datum.count + ' out of ' + datum.sum_count + ' companies'",
          "as": "count_label"
        },
        {
          "type": "formula",
          "expr": "{ value: datum.filter_value }",
          "as": "filter"
        }
      ]
    })

    bars['description'] = title;
    bars['data'] = data
    bars['width'] = width
    bars['height'] = height
    return embed(element, bars, options)
  }

  drawPieChartGroups(title: string,
                     year: number | string,
                     assessed_statements_metric_id: number[],
                     metric_id: number,
                     colors: string[],
                     groups: any[],
                     element: string,
                     width: number,
                     height: number,
                     options: {}) {
    var pie = JSON.parse(JSON.stringify(pieGroupsChart))

    let color_values: any = {}
    let range = ""
    for (let i in colors) {
      color_values['color_' + i] = colors[i]
      range += 'colors.' + 'color_' + i + ', '
    }
    range = "[" + range.substring(0, range.length - 2) + "]"
    pie["signals"][0]["value"] = color_values
    pie["description"] = title
    pie["data"][0]["values"] = groups
    pie["data"].unshift({
      "name": "answers",
      "url": `${this.wikirateApiHost}/~${metric_id}+Answer.json?view=answer_list&limit=0&filter[year]=${year}`,
      "transform": [
        {
          "type": "lookup",
          "from": "assessed",
          "key": "company",
          "fields": [
            "company"
          ],
          "values": [
            "value"
          ],
          "as": [
            "assessed"
          ]
        },
        {
          "type": "filter",
          "expr": "datum.assessed == 'Yes'"
        }
      ]
    })

    pie["data"].unshift({
      "name": "assessed",
      "url": `${this.wikirateApiHost}/~${assessed_statements_metric_id[1]}+Answer.json?view=answer_list&limit=0&filter[year]=${year}`,
      "transform": [
        {
          "type": "lookup",
          "from": "uk_assessed",
          "key": "company",
          "fields": ["company"],
          "values": ["value"],
          "as": ["uk_assessed"]
        },
        {
          "type": "formula",
          "as": "value",
          "expr": "datum.value == 'Yes' || datum.uk_assessed == 'Yes' ? 'Yes' : 'No'"
        }
      ]
    })
    pie["data"].unshift({
      name: 'uk_assessed',
      url: `${this.wikirateApiHost}/~${assessed_statements_metric_id[0]}+Answer.json?view=answer_list&limit=0&filter[year]=${year}`
    })
    pie["width"] = width
    pie["height"] = height
    pie["scales"][0]["range"] = colors
    pie["scales"][0]["range"]["signal"] = range
    return embed(element, pie, options)
  }
}
