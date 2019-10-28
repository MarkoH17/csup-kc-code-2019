import {HttpClient, HttpHeaders, HttpClientModule} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {of} from 'rxjs';
import {map} from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
// tslint:disable-next-line:class-name
export class process {
    industryData: any;
    locationData: any;
    resultData: any;
    blurbData: any;

    constructor(public http: HttpClient) {
    }

    load(): any {
        if (this.blurbData) {
            return of(this.blurbData);
        } else {
            return this.http
                .get('assets/data/data.json')
                .pipe(map(this.processBlurbData, this));
        }
    }

    processBlurbData(data: any) {
        this.blurbData = data.blurbs;
        return this.blurbData;
    }

    getIndustry(
        queryText = ''
    ) {
        const dat = {
            'query': queryText
        };
        return this.http
            .post('https://us-central1-csup-kccode2019.cloudfunctions.net/acIndustry', dat)
            .pipe(map((data: any) => {
                    this.industryData = data.topics;
                    return data;
                })
            );
    }

    getLocation(
        queryText: string
    ) {
        const dat = {
            'query' : queryText
        };
        return this.http
            .post('https://us-central1-csup-kccode2019.cloudfunctions.net/acLocation', dat)
            .pipe(map((data: any) => {
                    this.locationData = data.predictions;
                    return data.predictions;
                })
            );
    }

    getResult(
        postData: string
    ) {
        if (postData) {
            return this.http
                .post('https://us-central1-csup-kccode2019.cloudfunctions.net/calc', JSON.parse(postData))
                .pipe(map((data: any) => {
                        this.resultData = data;
                        return data;
                    })
                );
        }
    }
}
