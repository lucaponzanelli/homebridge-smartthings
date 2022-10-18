import { PlatformAccessory, CharacteristicValue } from 'homebridge';
import { IKHomeBridgeHomebridgePlatform } from '../platform';
import { BaseService } from './baseService';
import { MultiServiceAccessory } from '../multiServiceAccessory';

export class MotionService extends BaseService {

  constructor(platform: IKHomeBridgeHomebridgePlatform, accessory: PlatformAccessory, multiServiceAccessory: MultiServiceAccessory,
    name: string, deviceStatus) {
    super(platform, accessory, multiServiceAccessory, name, deviceStatus, platform.Service.MotionSensor);

    this.log.debug(`Adding MotionService to ${this.name}`);
    // this.service = this.accessory.getService(platform.Service.MotionSensor) ||
    //   this.accessory.addService(platform.Service.MotionSensor);

    // this.service.setCharacteristic(platform.Characteristic.Name, accessory.context.device.label);
    this.service.getCharacteristic(platform.Characteristic.MotionDetected)
      .onGet(this.getMotion.bind(this));

    let pollSensorSeconds = 5; // default to 10 seconds
    if (this.platform.config.PollSensorsSeconds !== undefined) {
      pollSensorSeconds = this.platform.config.PollSensorsSeconds;
    }

    if (pollSensorSeconds > 0) {
      multiServiceAccessory.startPollingState(pollSensorSeconds, this.getMotion.bind(this), this.service,
        platform.Characteristic.MotionDetected);
    }
  }

  // startService(platform: IKHomeBridgeHomebridgePlatform, accessory: PlatformAccessory): Service {
  //   this.service.setCharacteristic(platform.Characteristic.Name, accessory.context.device.label);
  //   this.service.getCharacteristic(platform.Characteristic.MotionDetected)
  //     .onGet(this.getMotion.bind(this));

  //   /**
  //    * Updating characteristics values asynchronously.
  //   */

  //   // let pollSensorSeconds = 5; // default to 10 seconds
  //   // if (this.platform.config.PollSensorsSeconds !== undefined) {
  //   //   pollSensorSeconds = this.platform.config.PollSensorsSeconds;
  //   // }

  //   // if (pollSensorSeconds > 0) {
  //   //   this.startPollingState(pollSensorSeconds, this.getMotion.bind(this), this.service, this.characteristic.MotionDetected);
  //   // }

  //   return this.service;
  // }

  async getMotion(): Promise<CharacteristicValue> {
    // if you need to return an error to show the device as "Not Responding" in the Home app:
    // throw new this.platform.api.hap.HapStatusError(this.platform.api.hap.HAPStatus.SERVICE_COMMUNICATION_FAILURE);
    this.log.debug('Received getMotion() event for ' + this.name);

    return new Promise((resolve, reject) => {
      this.getStatus().then(success => {
        if (success) {
          const motionValue = this.deviceStatus.status.motionSensor.motion.value;
          this.log.debug(`Motion value from ${this.name}: ${motionValue}`);
          resolve(motionValue === 'active' ? true : false);
        } else {
          reject(new this.platform.api.hap.HapStatusError(this.platform.api.hap.HAPStatus.SERVICE_COMMUNICATION_FAILURE));
        }
      });
    });
  }
}