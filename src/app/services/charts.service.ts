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
// @ts-ignore
import uk_tree_map from '../../assets/charts/uk_legislation_tree_map.json';
// @ts-ignore
import sector_beesworm_chart from '../../assets/charts/sector-specific-beesworm.json';
// @ts-ignore
import both_tree_map from '../../assets/charts/both_legislations_tree_map.json';
import {Injectable} from "@angular/core";
import embed from "vega-embed";
import {Filter} from "../models/filter.model";
import {DataProvider} from "./data.provider";

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
                     assessed_statements_metric_id: number,
                     metric: number,
                     year: number | string,
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
          "type": "filter",
          "expr": "datum.assessed === 'Yes'"
        },
        {
          "type": "formula",
          "as": "value",
          "expr": "test(/beyond tier 1/, datum.value)? 'beyond tier 1': 'direct'"
        }]
    })
    data.unshift({
      "name": "assessed",
      "url": `${this.wikirateApiHost}/~${assessed_statements_metric_id}+Answer.json?view=answer_list&limit=0&filter[year]=${year}`,
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
    meets_requirements_metric_id: number,
    metrics: [],
    year: number | string,
    company_groups: string[],
    options: {}) {
    let bars = JSON.parse(JSON.stringify(barChart))
    let data: any[] = []

    let filters: Filter[] = [new Filter('company_group', company_groups), new Filter('year', year)]
    data.push({
      "name": 'meets_min_requirements',
      "url": `${this.wikirateApiHost}/~${meets_requirements_metric_id}+Answer.json?${DataProvider.getParams(filters).toString()}`,
      "transform": [{"type": "formula", "as": "key", "expr": "datum.company + ',' + datum.year"}]
    })

    if (year == 'latest') {
      filters.pop()
    }

    let short_labels: any[] = []
    for (let metric of metrics) {
      short_labels.push(metric['short_label'])
      let condition = '';
      // @ts-ignore
      for (let value of metric['filter_value']) {
        condition += 'indexof(datum.value, \'' + value + '\') >= 0 || '
      }

      condition = condition.substring(0, condition.length - 3)
      data.push({
        name: metric['short_label'],
        "url": `${this.wikirateApiHost}/~${metric['id']}+answer.json?${DataProvider.getParams(filters).toString()}`,
        "transform": [
          {"type": "formula", "as": "key", "expr": "datum.company + ',' + datum.year"},
          {
            "type": "lookup",
            "from": "meets_min_requirements",
            "key": "key",
            "fields": ["key"],
            "values": ["value"],
            "as": ["meets_min_requirements"]
          },
          {
            "type": "filter",
            "expr": "datum.meets_min_requirements == 'Yes' || datum.meets_min_requirements == 'No' || datum.meets_min_requirements == 'Unknown'"
          },
          {
            "type": "formula",
            "as": "accepted_value",
            "expr": "if(" + condition + ", true, false)"
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
          "expr": "datum.count + ' out of ' + datum.sum_count + ' statements'",
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
    meets_requirements_metric_id: number,
    metric: number,
    subgroups: any,
    groups: any,
    year: number | string,
    company_groups: string[],
    options: {}) {
    let bars = JSON.parse(JSON.stringify(groupedBarsChart))
    let data: any[] = []

    let filters: Filter[] = [new Filter('company_group', company_groups), new Filter('year', year)]
    data.push({
      "name": 'meets_min_requirements',
      "url": `${this.wikirateApiHost}/~${meets_requirements_metric_id}+Answer.json?${DataProvider.getParams(filters).toString()}`,
      "transform": [{"type": "formula", "as": "key", "expr": "datum.company + ',' + datum.year"}]
    })

    if (year == 'latest') {
      filters.pop()
    }

    data.push({
      "name": "answers",
      "url": `${this.wikirateApiHost}/~${metric}+Answer.json?${DataProvider.getParams(filters).toString()}`,
      "transform": [
        {
          "type": "formula",
          "as": "key",
          "expr": "datum.company + ',' + datum.year"
        },
        {
          "type": "lookup",
          "from": "meets_min_requirements",
          "key": "key",
          "fields": ["key"],
          "values": ["value"],
          "as": ["meets_min_requirements"]
        },
        {
          "type": "filter",
          "expr": "datum.meets_min_requirements == 'Yes' || datum.meets_min_requirements == 'No' || datum.meets_min_requirements == 'Unknown'"
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
    return embed(element, bars, options)
  }

  drawBarChart(
    title: string,
    element: string,
    width: number,
    height: number,
    meets_requirements_metric_id: number,
    metrics: [],
    year: number | string,
    company_groups: string[],
    options: {}) {
    let bars = JSON.parse(JSON.stringify(barChart))
    let data: any[] = []

    let filters: Filter[] = [new Filter('company_group', company_groups), new Filter('year', year)]
    data.push({
      "name": 'meets_min_requirements',
      "url": `${this.wikirateApiHost}/~${meets_requirements_metric_id}+Answer.json?${DataProvider.getParams(filters).toString()}`,
      "transform": [{"type": "formula", "as": "key", "expr": "datum.company + ',' + datum.year"}]
    })

    if (year == 'latest') {
      filters.pop()
    }

    data.push({
      "name": "answers",
      // @ts-ignore
      "url": `${this.wikirateApiHost}/~${metrics[0]['id']}+Answer.json?${DataProvider.getParams(filters).toString()}`,
    })
    let short_labels: any[] = []
    for (let metric of metrics) {
      short_labels.push(metric['short_label'])
      let condition = '';
      // @ts-ignore
      for (let value of metric['filter_value']) {
        condition += 'indexof(datum.value, \'' + value + '\') >= 0 || '
      }
      condition = condition.substring(0, condition.length - 3)
      data.push({
        name: metric['short_label'],
        "source": ["answers"],
        "transform": [
          {
            "type": "formula",
            "as": "key",
            "expr": "datum.company + ',' + datum.year"
          },
          {
            "type": "lookup",
            "from": "meets_min_requirements",
            "key": "key",
            "fields": ["key"],
            "values": ["value"],
            "as": ["meets_min_requirements"]
          },
          {
            "type": "filter",
            "expr": "datum.meets_min_requirements == 'Yes' || datum.meets_min_requirements == 'No' || datum.meets_min_requirements == 'Unknown'"
          },
          {
            "type": "formula",
            "as": "accepted_value",
            "expr": "if(" + condition + ", true, false)"
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
          "expr": "datum.count + ' out of ' + datum.sum_count + ' statements'",
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

  drawSectorSpecificBeeSwarmChart(title: string,
                                  year: number | string,
                                  assessed_statements_metric_id: number,
                                  color: string,
                                  company_group: string,
                                  element: string,
                                  width: number,
                                  height: number,
                                  options: {}) {
    var bee_chart = JSON.parse(JSON.stringify(sector_beesworm_chart))
    var sector_assessed_url = `${this.wikirateApiHost}/~${assessed_statements_metric_id}+Answer.json?view=answer_list&limit=0&filter[year]=${year}&filter[company_group]=${company_group}&filter[value][]=Yes`;
    var sector_companies_url = `../assets/cached/${company_group.split(" ").join('_')}.json`;
    bee_chart['data'][2]['url'] = sector_companies_url
    bee_chart['data'][3]['url'] = sector_assessed_url
    if (company_group === "MSA_Garment")
      bee_chart['data'][3]['transform'].push({
        "type": "formula",
        "as": "sector",
        "expr": "'Garment'"
      })
    else if (company_group === "MSA_Food_Beverage")
      bee_chart['data'][3]['transform'].push({
        "type": "formula",
        "as": "sector",
        "expr": "'Food Beverage'"
      })
    else if (company_group === "MSA_Financial")
      bee_chart['data'][3]['transform'].push({
        "type": "formula",
        "as": "sector",
        "expr": "'Financial'"
      })
    else if (company_group === "MSA_Renewable_Energy")
      bee_chart['data'][3]['transform'].push({
        "type": "formula",
        "as": "sector",
        "expr": "'(Renewable) Energy'"
      })
    else
      bee_chart['data'][3]['transform'].push({
        "type": "formula",
        "as": "sector",
        "expr": "'Hospitality'"
      })
    bee_chart['scales'][1]["range"] = [color]

    return embed(element, bee_chart, options);
  }

  drawPieChartGroups(title: string,
                     year: number | string,
                     assessed_statements_metric_id: number,
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
          "type": "formula",
          "as": "key",
          "expr": "datum.company + ',' + datum.year"
        },
        {
          "type": "lookup",
          "from": "assessed",
          "key": "key",
          "fields": [
            "key"
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
      "url": `${this.wikirateApiHost}/~${assessed_statements_metric_id}+Answer.json?view=answer_list&limit=0&filter[year]=${year}`,
      "transform": [
        {
          "type": "formula",
          "as": "key",
          "expr": "datum.company + ',' + datum.year"
        }
      ]
    })
    pie["width"] = width
    pie["height"] = height
    pie["scales"][0]["range"] = colors
    pie["scales"][0]["range"]["signal"] = range
    return embed(element, pie, options)
  }

  uk_legislation_tree_map(values: any[],
                          element: string,
                          width: number,
                          height: number,
                          options: {}) {
    var treeMap = JSON.parse(JSON.stringify(uk_tree_map))
    treeMap["data"][0]["values"] = values;
    return embed(element, treeMap, options);
  }

  both_legislations_tree_map(values: any[],
                             element: string,
                             width: number,
                             height: number,
                             options: {}) {
    var treeMap = JSON.parse(JSON.stringify(both_tree_map))
    treeMap["data"][0]["values"] = values;
    console.log(JSON.stringify(treeMap))
    return embed(element, treeMap, options);
  }
}
