import { LightningElement, api } from 'lwc'
//import search from '@salesforce/apex/Rummage.search';

import NoLabel from './noLabel.html';
import Blank from './blank.html';
import Output from './output.html';

export default class ExtendaInput extends LightningElement {

    @api label
    @api placeholder
    @api type
    @api options
    @api value
    @api context
    @api editable
    @api inputType
    @api hide

	/* async connectedCallback() {
		const testArr = await search({
			fieldArray: ['Id', 'Name'],
			base:  `SELECT Id, Name FROM Account `,
			query: 'Ge',
		});

		console.log('testArr', testArr);
	} */

	get showNoLabel() {
		return !this.context?.showLabel;
	}

    render() {
		this.debug({where:'ExtendaInput.render'})
		if(this.hide) {
			return Blank;
		}
		if(this.editable === false) {
			return Output;
		}
		if(this.showNoLabel) {
			return NoLabel;
		}
		return NoLabel;
    }

    renderedCallback(){
        if((this.value && this.context) && !this.init){
            this.init = true
            this.template.querySelector('lightning-input').context = this.context
        }

		this.debug({where:'ExtendaInput.renderedCallback'})
    }

    custom__handleChange(event) {

        const { context } = this;
        const { value } = event.target;
		
		//type: 'input-change',
        const detail = {
			data: {
				value,
				context,
			},
		}
        
        this.dispatchEvent(new CustomEvent('change', {
            detail,
            composed: true,
            bubbles: true,
            cancelable: true,
        }))
    }

	debug(args) {
		console.log(JSON.parse(JSON.stringify({
			...args,
			label: this.label,
			placeholder: this.placeholder,
			type: this.type,
			value: this.value,
			context: this.context,
			editable: this.editable,
			inputType: this.inputType,
			showNoLabel: this.showNoLabel,
			showNothing: this.showNothing,
			output: this.output,
		})));
	}
}