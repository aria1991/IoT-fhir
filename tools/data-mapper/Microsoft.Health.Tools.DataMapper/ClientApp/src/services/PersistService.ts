﻿// -------------------------------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License (MIT). See LICENSE in the repo root for license information.
// -------------------------------------------------------------------------------------------------

// -------------
// Persist Services.
import * as _ from "lodash";
import { Mapping } from "../store/Mapping";
import * as Utils from "./Utils";

const LocalStorageKey = 'iomt-mappings';

interface MappingsStorage {
    mappingsById: MappingByIdIndex
}

interface MappingByIdIndex {
    [id: string]: Mapping
}

const loadFromLocalStorage = (): MappingsStorage => {
    const persistedData = localStorage.getItem(LocalStorageKey);
    return (persistedData ? JSON.parse(Utils.sanitize(persistedData)) : {}) as MappingsStorage;
}

const saveMappingToLocalStorage = (mappingId: string, mappingData: Mapping) => {
    const storage = loadFromLocalStorage();
    storage.mappingsById = {
        ...storage.mappingsById,
        [mappingId]: mappingData
    }
    localStorage.setItem(LocalStorageKey, Utils.sanitize(JSON.stringify(storage)));
    return mappingData;
}

const deleteMappingInLocalStorage = (mappingId: string) => {
    const storage = loadFromLocalStorage();
    storage.mappingsById = _.omit(storage.mappingsById, mappingId);
    localStorage.setItem(LocalStorageKey, Utils.sanitize(JSON.stringify(storage)));
}

const getAllMappings = (): Mapping[] => {
    const mappingsById = loadFromLocalStorage().mappingsById;
    return _.values(mappingsById);
}

const getMapping = (mappingId: string): Mapping => {
    const storage = loadFromLocalStorage();
    return storage.mappingsById[mappingId];
}

const createMapping = (typename: string): Promise<Mapping> => {
    const id = generateUID();
    return updateMapping(id, typename);
}

const updateMapping = (id: string, typename: string): Promise<Mapping> => {
    return new Promise((resolve, reject) => {
        if (!typename || typename.trim().length < 1) {
            reject(`The type name cannot be empty`);
            return;
        }

        const existingMapping = getMapping(id);
        if (existingMapping && existingMapping.typeName === typename) {
            resolve(existingMapping);
            return;
        }

        const mappings = getAllMappings();
        if (_.find(mappings, { typeName: typename })) {
            reject(`The type name ${typename} already exists`);
            return;
        }

        const mapping = {
            id: id,
            typeName: typename
        } as Mapping;
        saveMappingToLocalStorage(id, mapping);

        resolve(mapping);
        return;
    });
}

const generateUID = () => {
    var dt = new Date().getTime();
    var uuid = 'xxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (dt + Math.random() * 16) % 16 | 0;
        dt = Math.floor(dt / 16);
        return (c === 'x' ? r : ((r & 0x3) | 0x8)).toString(16);
    });
    return uuid;
}

// The service is providing basic CRUD operations.
// This can be changed to Restful APIs hosted by
// the backend server.
const PersistService = {
    createMapping: createMapping,
    getAllMappings: getAllMappings,
    getMapping: getMapping,
    renameMapping: updateMapping,
    saveMapping: saveMappingToLocalStorage,
    deleteMapping: deleteMappingInLocalStorage
}

export default PersistService;