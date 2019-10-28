# KC Fed Code-A-Thon 2019

## The Team

_Thunderwolves @ Colorado State University—Pueblo_

Mark Hedrick — [@MarkoH17](https://github.com/MarkoH17)

Michael Zamora — [@mikezamora1998](https://github.com/mikezamora1998)

David Lichliter — [@dlichliter](https://github.com/dlichliter)

Brandon Carlsen — [@btcarlsen](https://github.com/btcarlsen)

## The Application - Sma[rt] (Social Media Analysis in Real Time)
Every new business starts with an idea; however, new businesses that do not test the feasibility of that idea are doomed to failure.
Most small business owners cannot afford a full market analysis to test the feasibility of a product in a given market.
The problem that this application aims to solve is that when you want to open your own business, prospective business owners struggle to 
decide what type of business start. If you don't perform some level of market analysis a new business owner may find them self in an industry
in an over-saturated market with a content customer base. 

The SMA[RT] application utilizes live Google Trends data to measure interest in a given industry (within a region) and uses this data to compute a trend score. A positive trend indicates that social interest in the specified industry is growing which is ideal for prospective business owners. Likewise, a downward trend indicates that starting a business within the region may not be supported by social trends. This information is presented along with Google Places review data in the given industry and region to analyze market satisfaction. Measuring the average rating data for a given industry within a region provides our application a way to help users understand if there is room in the market for their business. 

Altogether, trends from the area gives an idea about whether the market is hungry for the industry; and when paired with customer reviews in the area, a new business owner could determine if the market is ready for a new industry, or if they are dissatisfied with the options in their market and are ready for a change. 

When using our application, users should expect to receive a 'Smart Analysis' score that helps them determine whether or not they should open a business in a certain region. Our hope is that our application can provide even the smallest of small business owner with a market research department accessible in their pocket. Fostering 
entrepreneurship starts when a prospective business plans to open its doors, and this application will grease the hinges to get those doors open sooner.

[**YouTube Video**](https://youtu.be/muSU8MKRke0)
	

## Live Demo
[Visit Site](https://csup-kccode2019.firebaseapp.com/) (only active through November 8th, 2019)

## The Build

``` bash
#Install Required Packages
npm install -g ionic

#Clone the repository
git clone https://github.com/MarkoH17/csup-kc-code-2019
cd kc-code-2019

#Install Dependencies
npm install
cd functions && npm install
cd ../ && ionic serve
```

## Additional Requirements
    API Key for the following Google services:
        - Places API
        - Geocoding API
