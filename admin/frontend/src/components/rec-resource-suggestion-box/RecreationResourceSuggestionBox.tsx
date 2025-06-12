import { useState } from "react";
import { AsyncTypeahead, Menu } from "react-bootstrap-typeahead";
import Form from "react-bootstrap/Form";
import "react-bootstrap-typeahead/css/Typeahead.css";
import { SuggestionDto } from "@/service/recreation-resource-admin";
import { useGetRecreationResourceSuggestions } from "@/service/hooks/recreation-resource-admin/useGetRecreationResourceSuggestions";
import { SuggestionListItem } from "@/components/rec-resource-suggestion-box/SuggestionListItem";
import { SuggestionSearchInput } from "@/components/rec-resource-suggestion-box/SuggestionSearchInput";

export const RecreationResourceSuggestionBox = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const {
    data: { suggestions },
    isFetching,
    error,
    isError,
  } = useGetRecreationResourceSuggestions(searchTerm);

  return (
    <Form>
      <Form.Group controlId="recreation-resource-suggestion">
        <Form.Label>Recreation Resource</Form.Label>
        <AsyncTypeahead
          id="recreation-resource-suggestion"
          onSearch={setSearchTerm}
          options={suggestions}
          isLoading={isFetching}
          renderInput={SuggestionSearchInput}
          minLength={3}
          emptyLabel="No results found"
          placeholder="Search for a trail..."
          labelKey="name"
          isInvalid={isError}
          filterBy={(option, props) => {
            const customOption = option as SuggestionDto;
            const searchTerm = props.text.toLowerCase();
            return (
              (Boolean(customOption.name) &&
                customOption.name.toLowerCase().includes(searchTerm)) ||
              (Boolean(customOption.rec_resource_id) &&
                customOption.rec_resource_id.toLowerCase().includes(searchTerm))
            );
          }}
          renderMenu={(results, menuProps) => (
            <Menu {...menuProps}>
              {results.map((option) => {
                const {
                  rec_resource_id,
                  recreation_resource_type_code,
                  recreation_resource_type,
                  district_description,
                  name,
                } = option as SuggestionDto;
                return (
                  <SuggestionListItem
                    key={rec_resource_id}
                    searchTerm={searchTerm}
                    district={district_description}
                    icon={recreation_resource_type_code}
                    rec_resource_id={rec_resource_id}
                    resourceType={recreation_resource_type}
                    title={name}
                  />
                );
              })}
            </Menu>
          )}
        />
        {error && (
          <Form.Control.Feedback type="invalid" className="d-block">
            {error.message}
          </Form.Control.Feedback>
        )}
      </Form.Group>
    </Form>
  );
};
