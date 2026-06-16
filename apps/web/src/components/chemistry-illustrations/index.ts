import { type ComponentType } from 'react';
import { MolConceptAnimation } from './MolConceptAnimation';
import { GasMolarVolumeAnimation } from './GasMolarVolumeAnimation';
import { ConcentrationAnimation } from './ConcentrationAnimation';
import { ElectrolyteAnimation } from './ElectrolyteAnimation';
import { IonEquationsAnimation } from './IonEquationsAnimation';
import { PrecipitationAnimation } from './PrecipitationAnimation';
import { RedoxAnimation } from './RedoxAnimation';
import { AtomStructureAnimation } from './AtomStructureAnimation';
import { IonicCovalentBondAnimation } from './IonicCovalentBondAnimation';
import { EnthalpyAnimation } from './EnthalpyAnimation';
import { HessLawAnimation } from './HessLawAnimation';
import { ReactionRateAnimation } from './ReactionRateAnimation';
import { CollisionTheoryAnimation } from './CollisionTheoryAnimation';
import { AlkanesAlkenesAnimation } from './AlkanesAlkenesAnimation';
import { AlcoholsPhenolsAnimation } from './AlcoholsPhenolsAnimation';

/** 知识点 slug → 对应的动画组件映射 */
export const illustrationMap: Record<string, ComponentType> = {
  'mol-concept': MolConceptAnimation,
  'gas-molar-volume': GasMolarVolumeAnimation,
  'amount-concentration': ConcentrationAnimation,
  'electrolyte': ElectrolyteAnimation,
  'ion-equations': IonEquationsAnimation,
  'precipitation': PrecipitationAnimation,
  'redox-intro': RedoxAnimation,
  'atom-structure': AtomStructureAnimation,
  'ionic-covalent-bond': IonicCovalentBondAnimation,
  'enthalpy': EnthalpyAnimation,
  'hess-law': HessLawAnimation,
  'rate-factors': ReactionRateAnimation,
  'collision-theory': CollisionTheoryAnimation,
  'alkanes-alkenes': AlkanesAlkenesAnimation,
  'alcohols-phenols': AlcoholsPhenolsAnimation,
};
