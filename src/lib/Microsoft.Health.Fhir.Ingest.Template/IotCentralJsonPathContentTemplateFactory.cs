﻿// -------------------------------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License (MIT). See LICENSE in the repo root for license information.
// -------------------------------------------------------------------------------------------------

using EnsureThat;
using Microsoft.Health.Fhir.Ingest.Template;
using Newtonsoft.Json.Linq;

namespace Microsoft.Health.Fhir.Ingest.Template
{
    public class IotCentralJsonPathContentTemplateFactory : HandlerProxyTemplateFactory<TemplateContainer, IContentTemplate>
    {
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Globalization", "CA1303:Do not pass literals as localized parameters", Justification = "Exception message")]
        public override IContentTemplate Create(TemplateContainer jsonTemplate)
        {
            EnsureArg.IsNotNull(jsonTemplate, nameof(jsonTemplate));

            const string targetTypeName = "IotCentralJsonPathContent";
            if (!jsonTemplate.MatchTemplateName(targetTypeName))
            {
                return null;
            }

            if (jsonTemplate.Template?.Type != JTokenType.Object)
            {
                throw new InvalidTemplateException($"Expected an object for the template property value for template type {targetTypeName}.");
            }

            var facade = new JsonPathCalculatedFunctionContentTemplateAdapter<IotCentralJsonPathContentTemplate>(
                jsonTemplate.Template.ToValidTemplate<IotCentralJsonPathContentTemplate>());

            return new LegacyMeasurementExtractor(facade, new JsonPathExpressionEvaluatorFactory());
        }
    }
}
