import { LightningElement,api, track} from 'lwc';
//import { ShowToastEvent } from 'lightning/platformShowToastEvent';
//import uploadFile from '@salesforce/apex/ReadFile.uploadFile'

export default class Tester extends LightningElement {
    
    connectedCallback(){
        this.log('connectedCallback');
    }

    log(data){
        console.log('TESTER:');
        console.log(data);
    }
}