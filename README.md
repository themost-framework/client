[![npm](https://img.shields.io/npm/v/@themost%2Fclient.svg)](https://www.npmjs.com/package/@themost%2Fclient)
![GitHub top language](https://img.shields.io/github/languages/top/themost-framework/client)
[![License](https://img.shields.io/npm/l/@themost/client)](https://github.com/themost-framework/themost-client/blob/master/LICENSE)
![GitHub last commit](https://img.shields.io/github/last-commit/themost-framework/client)
![GitHub Release Date](https://img.shields.io/github/release-date/themost-framework/client)
[![npm](https://img.shields.io/npm/dw/@themost/client)](https://www.npmjs.com/package/@themost%2Fclient)
[![Snyk Vulnerabilities for npm package](https://img.shields.io/snyk/vulnerabilities/npm/@themost/client)](https://snyk.io/vuln/npm:%40themost%2Fclient)

# @themost/client

![MOST Web Framework Logo](https://github.com/themost-framework/common/raw/master/docs/img/themost_framework_v3_128.png)

[@themost-framework](https://github.com/themost-framework) core module for javascript clients.

`@themost/client` provides a set of methods for creating [OData v4](https://www.odata.org/documentation/) queries by using javascript closures in both client and server.

e.g. get name and price of products with category equals to 'Laptops'

    // GET /Products?$select=name,price&$filter=category eq 'Laptops'
    
    const items = await context.model('Products').select(({name, price}) => {
        return {
            name,
            price
        }
    }).where(({category}) => {
        return category === 'Laptops'
    }).getItems();

Javascript closure prototypes introduced by [@themost/query](https://github.com/themost-framework/query) uses native language and produces equivalent query expressions for both client and server environments:

    import { round } from '@themost/query';

    context.model('Products').select((x) => {
        return {
            name: x.name,
            releaseYear: x.releaseDate.getFullYear(),
            price: round(x.price, 2)
        }
    }).where((x) => {
        return x.category === 'Laptops';
    })
    ...

which produces the following OData expression `/Products?$select=name,year(releaseDate) as releaseYear,round(price,2) as price&$filter=category eq 'Laptops'`

or an equivalent SQL statement for server-side enviroments `SELECT Products.name AS name, YEAR(Products.releaseDate) AS releaseYear, ROUND(Products.price,2) AS price FROM Products WHERE Products.category = 'Laptops'`


## node.js client

![@themost/node](docs/nodejs.png)

[@themost/node](https://github.com/themost-framework/node) is a client module for node.js applications which are going to use [@themost-framework](https://github.com/themost-framework) as backend api server.

## angular client

![@themost/angular](docs/angular.png)

[@themost/angular](https://github.com/themost-framework/angular) is a client module for angular 2.x+ applications which are going to use [@themost-framework](https://github.com/themost-framework) as backend api server.

## react client

![@themost/react](docs/react.png)

[@themost/react](https://github.com/themost-framework/react) is a client module for react applications which are going to use [@themost-framework](https://github.com/themost-framework) as backend api server.

## jQuery client

![@themost/jquery](docs/jquery.png)

[@themost/jquery](https://github.com/themost-framework/jquery) is a client module for JQuery scripts and applications which are going to use [@themost-framework](https://github.com/themost-framework) as backend api server.

## Usage

use `ClientDataContext` which is being provided by your environment and initialize an instance of `ClientDataQueryable` class.

### System Query Options

- [$select](#selectexpr-queryfunc-params-any)
- [$filter](#whereexpr-queryfunc-params-any)
    - [Logical Operators](#logical-operators)
    - [Comparison Operators](#comparison-operators)
    - [Aggregate Functions](#aggregate-function)
    - [String Functions](#string-functions)
    - [Date Functions](#date-functions)
    - [Math Functions](#math-functions)
    - [Arithmetic Operators](#arithmetic-operators)
- [$orderby](#orderbyexpr-queryfunc-params-any)
- [$expand](#expandargs-opendataquery--queryfunc)
- [$top](#taken-number)
- [$skip](#skip-number)

Read OData v4 specification for more information about system query options: 

http://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part2-url-conventions.html#_Toc31360955

### select(expr: QueryFunc<T>, ...params: any[])

Define `$select` system query option by using a javascript closure:

    const items = await context.model('Orders')
        .asQueryable()
        .select((x) => {
            return {
                id: x.id,
                customer: x.customer.description,
                orderDate: x.orderDate,
                product: x.orderedItem.name
            }
        })
        .where((x) => {
            return x.paymentMethod.alternateName === 'DirectDebit';
        }).orderByDescending((x) => x.orderDate)
        .take(10)
        .getItems();

> `/Orders?$select=id,customer/description as customer,orderDate,orderedItem/name as product&$filter=paymentMethod/alternateName eq 'DirectDebit'&$orderby=orderDate desc&$top=10`

### where(expr: QueryFunc<T>, ...params: any[])

Define `$filter` system query option by using a javascript closure:

    const items = await context.model('Orders')
        .asQueryable()
        .where((x, orderStatus) => {
            return x.orderStatus.alternateName === orderStatus;
        }, 'OrderPickup').take(10)
        .getItems();

> `/Orders?$filter=orderStatus/alternateName eq 'OrderPickup'&$top=10`

#### Using parameters

A query expression can accept parameters as additional arguments. The following example demonstrates how to use parameters in a query expression e.g.

```javascript
const items = await context.model('Orders')
    .asQueryable()
    .where((x, orderStatus) => {
        return x.orderStatus.alternateName === orderStatus;
    }, 'OrderPickup').take(10)
    .getItems();
```
where the first parameter is a query closure and the second parameter is a string value which is going to be passed to closure as `orderStatus` argument.

```javascript
const items = await context.model('Orders')
    .asQueryable()
    .where((x, orderStatus, productCategory) => {
        return x.orderStatus.alternateName === orderStatus &&
            x.orderedItem.category === productCategory;
    }, 'OrderPickup', 'Desktops').take(10)
    .getItems();
```



#### Logical Operators

Use logical operators while querying data:

    const items = await context.model('Products')
        .asQueryable()
        .where(({category}) => {
            return category === 'Laptops' ||
                category === 'Desktops';
        }).getItems();

> `/People?$filter=(category eq 'Laptops' or category eq 'Desktops')`

    import { round } from '@themost/query';

    const items = await context.model('Products')
        .asQueryable()
        .where(({category, price}) => {
            return category === 'Laptops' && price <=900;
        }).getItems();

> `/People?$filter=(category eq 'Laptops' and price le 900)`

#### Comparison operators

`@themost/client` supports the usage of OData comparison operators like `eq`, `ne`, `lt`, `le` etc

##### equals

    const items = await context.model('Orders')
        .asQueryable()
        .where(({id}) => {
            return id === 100;
        }).getItem();

> `/Orders?$filter=id eq 100`

##### not equals

    const item = await context.model('Orders')
        .asQueryable()
        .where(({category}) => {
            return category !== 'Desktops';
        }).getItems();

> `/Orders?$filter=category ne 'Desktops'`


##### greater than

    const items = await context.model('Orders')
        .asQueryable()
        .where(({category, price}) => {
            return category === 'Desktops' && price > 1000;
        }).getItems();

> `/Orders?$filter=(category eq 'Desktops' and price gt 1000)`

##### greater than or equal

    const item = await context.model('Orders')
        .asQueryable()
        .where(({category, price}) => {
            return category === 'Desktops' && price >= 1000;
        }).getItems();

> `/Orders?$filter=(category eq 'Desktops' and price ge 1000)`

##### lower than

    const items = await context.model('Orders')
        .asQueryable()
        .where(({category, price}) => {
            return category === 'Desktops' && price < 1200;
        }).getItems();

> `/Orders?$filter=(category eq 'Desktops' and price lt 1200)`

##### lower than or equal

    const items = await context.model('Orders')
        .asQueryable()
        .where(({category, price}) => {
            return category === 'Desktops' && price <= 1200;
        }).getItems();

> `/Orders?$filter=(category eq 'Desktops' and price le 1200)`

#### Aggregate functions

`@themost/client` supports the usage of aggregate functions like `count`, `min`, `max` for getting
aggregated results

##### count

    import { count } from '@themost/query';

    const items = await context.model('Products')
        .asQueryable()
        .select((x) => {
            return {
                category: x.category,
                total: count(x.id)
            };
        }).groupBy((x) => x.category)
        .getItems();

> `/Products?$select=category,count(id) as total&$groupby=category`

##### min

    import { min } from '@themost/query';

    const items = await context.model('Products')
        .asQueryable()
        .select((x) => {
            return {
                category: x.category,
                minimumPrice: min(x.price)
            };
        }).groupBy((x) => x.category)
        .getItems();

> `/Products?$select=category,min(price) as minimumPrice&$groupby=category`

##### min

    import { max } from '@themost/query';

    const items = await context.model('Products')
        .asQueryable()
        .select((x) => {
            return {
                category: x.category,
                maxPrice: max(x.price)
            };
        }).groupBy((x) => x.category)
        .getItems();

> `/Products?$select=category,max(price) as maxPrice&$groupby=category`

#### String functions

`@themost/client` supports the usage of string functions while querying data

##### indexof

    const items = await context.model('Products')
        .asQueryable()
        .where((x) => {
            return x.name.indexOf('Intel') >= 0;
        })
        .getItems();

> `/Products?$filter=indexof(name,'Intel') ge 0`

##### startsWith

    const items = await context.model('Products')
        .asQueryable()
        .where((x) => {
            return x.name.startsWith('Intel') === true;
        })
        .getItems();

> `/Products?$filter=startswith(name,'Intel') eq true`

##### endsWith

    const items = await context.model('Products')
        .asQueryable()
        .where((x) => {
            return x.name.endsWith('Edition') === true;
        })
        .getItems();

> `/Products?$filter=endswith(name,'Edition') eq true`


##### toLowerCase

    const items = await context.model('Products')
        .asQueryable()
        .where((x) => {
            return x.category.toLowerCase() === 'laptops';
        })
        .getItems();

> `/Products?$filter=tolower(category) eq 'laptops'`

##### toUpperCase

    const items = await context.model('Products')
        .asQueryable()
        .where((x) => {
            return x.category.toUpperCase() === 'LAPTOPS';
        })
        .getItems();

> `/Products?$filter=toupper(category) eq 'LAPTOPS'`

##### substring

    const items = await context.model('Products')
        .asQueryable()
        .where((x) => {
            return x.category.substring(0,3) === 'Lapt';
        })
        .getItems();

> `/Products?$filter=substring(category,0,3) eq 'Lapt'`

#### Date functions

`@themost/client` supports also the usage of date functions while querying data

##### getDate


    const items = await context.model('Orders')
        .asQueryable()
        .where((x) => {
            return x.orderDate.getDate() === 0;
        })
        .getItems();

> `/Orders?$filter=day(orderDate) eq 19`

##### getMonth


    const items = await context.model('Orders')
        .asQueryable()
        .where((x) => {
            return x.orderDate.getMonth() === 0;
        })
        .getItems();

> `/Orders?$filter=(month(orderDate) sub 1) eq 0`

##### getFullYear


    const items = await context.model('Orders')
        .asQueryable()
        .where((x) => {
            return x.orderDate.getFullYear() === 2019;
        })
        .getItems();

> `/Orders?$filter=(month(orderDate) sub 1) eq 0`

##### getHours


    const items = await context.model('Orders')
        .asQueryable()
        .where((x) => {
            return x.orderDate.getHours() === 14;
        })
        .getItems();

> `/Orders?$filter=hour(orderDate) eq 14`

##### getMinutes


    const items = await context.model('Orders')
        .asQueryable()
        .where((x) => {
            return x.orderDate.getMinutes() === 30;
        })
        .getItems();

> `/Orders?$filter=minute(orderDate) eq 30`

##### getSeconds


    const items = await context.model('Orders')
        .asQueryable()
        .where((x) => {
            return x.orderDate.getSeconds() === 30;
        })
        .getItems();

> `/Orders?$filter=second(orderDate) eq 30`

### Math Functions

#### floor

    const items = await context.model('Products')
        .asQueryable()
        .where((x) => {
            return Math.floor(x.price) <= 177;
        })
        .getItems();

> `/Products?$filter=floor(price) le 177`

#### ceil

    const items = await context.model('Products')
        .asQueryable()
        .where((x) => {
            return Math.ceil(x.price) >= 177;
        })
        .getItems();

> `/Products?$filter=floor(price) ge 177`

#### round

    import { round } from '@themost/query';

    const items = await context.model('Products')
        .asQueryable()
        .where((x) => {
            return round(x.price, 2) >= 177;
        })
        .getItems();

> `/Products?$filter=round(price, 2) ge 177`

### Arithmetic operators

#### add

    import { round } from '@themost/query';

    const items = await context.model('Products')
        .asQueryable()
        .where((x) => {
            return round(x.price, 2) + 100 >= 277;
        })
        .getItems();

> `/Products?$filter=(round(price,2) add 100) ge 277`

#### subtract

    import { round } from '@themost/query';

    const items = await context.model('Products')
        .asQueryable()
        .where((x) => {
            return round(x.price, 2) - 100 <= 277;
        })
        .getItems();

> `/Products?$filter=(round(price,2) sub 100) le 277`

#### multiply

    import { round } from '@themost/query';

    const items = await context.model('Products')
        .asQueryable()
        .where((x) => {
            return round(x.price, 2) * 0.75 < 800;
        })
        .getItems();

> `/Products?$filter=(round(price,2) mul 0.75) lt 800`

#### divide

    import { round } from '@themost/query';

    const items = await context.model('Products')
        .asQueryable()
        .where((x) => {
            return round(x.price, 2) / 1.25 < 800;
        })
        .getItems();

> `/Products?$filter=(round(price,2) div 1.25) lt 800`

#### case

    import { round } from '@themost/query';

    const items = await context.model('Products')
        .asQueryable()
        .select(({name, price}) => {
            return {
                name: name,
                value: price < 800 ? 'Normal' : 'Expensive'
            }
        })
        .where(({category}) => {
            return category === 'Laptops';
        })
        .getItems();

> `/Products?$select=name,case(price lt 800:'Normal',true:'Expensive') as value&$filter=category eq 'Laptops'`


### take(n: number)

Set `$top` system query option for defining the number of records to be taken

    const items = await context.model('Orders')
        .asQueryable()
        .where((x, orderStatus) => {
            return x.orderStatus.alternateName === orderStatus;
        }, 'OrderPickup').take(10)
        .getItems();

> `/Orders?$filter=orderStatus/alternateName eq 'OrderPickup'&$top=10`

### skip(n: number)

Set `$skip` system query option for defining the number of records to be skipped

    const items = await context.model('Orders')
        .asQueryable()
        .where((x, orderStatus) => {
            return x.orderStatus.alternateName === orderStatus;
        }, 'OrderPickup').take(25)
        .skip(25)
        .getItems();

> `/Orders?$filter=orderStatus/alternateName eq 'OrderPickup'&$top=25&$skip=25`

### orderBy(expr: QueryFunc<T>, ...params: any[])

Define `$orderby` system query option for sorting records

    const items = await context.model('People')
        .asQueryable()
        .orderBy(({familyName}) => familyName)
        .getItems();

> `/People?$orderby=familyName`

### thenBy(expr: QueryFunc<T>, ...params: any[])

    const items = await context.model('People')
        .asQueryable()
        .orderBy(({familyName}) => familyName)
        .thenBy(({givenName}) => givenName)
        .getItems();

> `/People?$orderby=familyName,givenName`

### orderByDescending(expr: QueryFunc<T>, ...params: any[])

    const items = await context.model('People')
        .asQueryable()
        .orderByDescending(({familyName}) => familyName)
        .getItems();

> `/People?$orderby=familyName desc`

### thenByDescending(expr: QueryFunc<T>, ...params: any[])

    const items = await context.model('People')
        .asQueryable()
        .orderByDescending(({familyName}) => familyName)
        .thenByDescending(({givenName}) => givenName)
        .getItems();

> `/People?$orderby=familyName desc,givenName desc`


### groupBy<T>(...arg: [QueryFunc<T>], params?: any)

Define `$groupby` system query option to group records by using javascript closures:

    const results = await context.model('Orders')
        .asQueryable()
        .select(({id, orderStatus}) => {
            return {
                total: count(id),
                orderStatus
            }
        }).groupBy(({orderStatus}) => orderStatus)
        .getItems();

> `/Orders?$select=count(id) as total,orderStatus&$groupby=orderStatus`

### expand<T>(...args: (OpenDataQuery | QueryFunc<T>)[])

Define `$expand` system query option for getting nested objects

Read more about `$expand` at http://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part2-url-conventions.html#_Toc31361039

    const items= await context.model('Orders')
        .asQueryable()
        .select(({id, orderStatus, orderDate}) => {
            return {
                id,
                orderStatus,
                orderDate
            }
        }).expand(
            (x) => x.customer,
            (x) => x.orderedItem
        ).getItems();

> `/Orders?$select=id,orderStatus,orderDate&$expand=customer,orderedItem`

or use query expressions for applying nested query options:

    import { any } from '@themost/query';

    const items= await context.model('People')
        .asQueryable()
        .expand(
            any((x) => x.address)
            .select(({id, streetAddress, addressLocalilty}) => ({
                id, streetAddress, addressLocalilty
            }))
        ).getItems();

> `/People?$expand=address($select=id,streetAddress,addressLocalilty;$expand=addressCountry)`

## Using CLI

`@themost/client` provides a command line interface for generating client-side type declarations from an OData metadata service.

Connect to an OData service and generate client-side type declarations:

```bash
$ npx @themost/client http://localhost:3000/api/
```
or extract metadata from an OData metadata document:

```bash
$ npx @themost/client ./metadata.xml
```
Use `--out-file` option for specifying the output file:

```bash
$ npx @themost/client http://localhost:3000/api/ --out-file ./client.d.ts
```
