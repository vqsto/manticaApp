import { Component, OnInit } from '@angular/core';
import { Data } from '../../services/data';
import { DataService } from '../../services/data.service';

import { NavController, Platform } from 'ionic-angular';
import { DevisPage } from '../devis/devis';


@Component({
	selector: 'capacite',
	templateUrl: 'capacite.html'
})
export class CapacitePage implements OnInit {

	datas: Data;
	result: any;
	resultSal: number;

	taux: any[];
	ios: boolean = false;


	constructor(private nav: NavController, private _dataService: DataService, private platform: Platform) {
		this.platform = platform;

		if (this.platform.is('ios')) {
			// This will only print when on iOS
			this.ios = true;
		}
	}


	ngOnInit() {
		this.getDatas();

	}

	getDatas() {
		// on recupere le taux sur emantica
		this._dataService.getTaux().subscribe(
			taux => this.taux = taux,
			error => this.taux = null);


		this._dataService.getDatas().then((data: Array<any>) => {
			this.datas = {
				montant: data[0] || null,
				mensualites: data[1] || null,
				duree: data[2] || null,
				interets: data[3] || null,
				dossier: data[4] || null,
				assurance: data[5] || null,
				caution: data[6] || null,
				apport: data[7] || null,
				notaire: data[8] || null
			}, rejet => {
				console.log(rejet)
			};
			this.calcul();
		});
	}

	calcul() {

		this.resultSal =
			(
				this.datas.mensualites *
				(1 - Math.pow((1 + ((this.datas.interets / 100) / 12)), -this.datas.duree * 12)) /
				((this.datas.interets / 100) / 12)
			);

		// this.montantAssurance = (this.datas.assurance * this.datas.duree * (this.resultSal / 100)); on a retirer les assurances

			this.result = this.formatMillier(Math.round(this.resultSal));

		if (this.resultSal > 0) { // sauvegarde de la capacite d'emprunt qui est égal au budget du client
			this._dataService.save('capacite', Math.round(this.result));

		}
	}



	formatMillier(nombre) {
		nombre += '';
		let sep = ' ';
		let reg = /(\d+)(\d{3})/;
		while (reg.test(nombre)) {
			nombre = nombre.replace(reg, '$1' + sep + '$2');
		}
		return nombre;
	}


	onKey(field: string, value: number) {


		this._dataService.save(field, value);

		this.calcul();
	}

	openDevis() {
		this.nav.setRoot(DevisPage);
	}


	calculTaux(val: number) {
		let interet;
		if (this.taux) {
			this.taux.forEach(function (element) {
				if (val >= element.duree) {
					interet = element.taux;
				}
			});
			this.datas.interets = interet;
			this._dataService.save('interets', interet);
		}
	}



}
